# CQRS

[← Página anterior](03-lab-redis-cache.md) · [Siguiente página →](../M05-seguridad-y-autenticacion/README.md)

Vas a aceptar `PED-1001` en PostgreSQL y a servir el GET desde Redis, con un retraso a propósito entre las dos cosas.

### Objetivo

Recibir 201 en el POST, 404 en el GET inmediato y 200 con el pedido cuando la proyección ha corrido.

### Punto de partida

```bash
mkdir -p ~/nexo/m04-cqrs && cd ~/nexo/m04-cqrs
npm init -y
npm pkg set type=module
npm install express@5 sequelize pg ioredis
docker rm -f nexo-pg nexo-redis >/dev/null 2>&1 || true
docker run -d --name nexo-pg \
  -e POSTGRES_PASSWORD=nexo -e POSTGRES_DB=pedidos -p 5432:5432 postgres:16
docker run -d --name nexo-redis -p 6379:6379 redis:7
until docker exec nexo-pg pg_isready -U postgres; do sleep 2; done
until docker exec nexo-redis redis-cli ping | grep -q PONG; do sleep 1; done
```

- Puerto 3002 libre: este proceso es `pedidos`, no el catálogo.
- PostgreSQL `postgres://postgres:nexo@127.0.0.1:5432/pedidos`. Redis sin clave.

### En qué consiste

El POST escribe la fila y programa la copia a Redis para 1,5 segundos después. El GET solo mira Redis. En ese hueco se ve la consistencia eventual.

### 1 — Escribe el servicio

**Acción:** guarda `server.mjs`.

```js
import express from 'express';
import { Sequelize, DataTypes } from 'sequelize';
import Redis from 'ioredis';

const sequelize = new Sequelize('postgres://postgres:nexo@127.0.0.1:5432/pedidos', { logging: false });
const Pedido = sequelize.define('Pedido', {
  id: { type: DataTypes.STRING, primaryKey: true },
  sku: DataTypes.STRING,
  estado: DataTypes.STRING,
}, { tableName: 'pedidos', timestamps: false });
await sequelize.sync();

const redis = new Redis('redis://127.0.0.1:6379');
const app = express();
app.use(express.json());

app.post('/pedidos', async (req, res) => {
  const pedido = { id: 'PED-1001', sku: 'NX-1', estado: 'aceptado' };
  await Pedido.upsert(pedido);
  setTimeout(() => {
    redis.set('pedido:PED-1001', JSON.stringify(pedido));
  }, 1500);
  res.status(201).json(pedido);
});

app.get('/pedidos/:id', async (req, res) => {
  const crudo = await redis.get(`pedido:${req.params.id}`);
  if (!crudo) {
    res.status(404).json({ error: 'aun no proyectado' });
    return;
  }
  res.json(JSON.parse(crudo));
});

app.listen(3002, () => console.log('pedidos en 3002'));
```

**Por qué:** el comando y la consulta no usan el mismo almacén. El 201 dice «la fila está en PostgreSQL». No dice «la pantalla ya puede leerlo». El `setTimeout` hace visible el intervalo que una proyección real también tiene.

**Resultado esperado:** `server.mjs` creado.

### 2 — Arranca

**Acción:**

```bash
node server.mjs
```

**Por qué:** el POST y el GET hablan con el puerto 3002.

**Resultado esperado:** `pedidos en 3002`.

### 3 — Acepta el pedido y léelo enseguida

**Acción:**

```bash
curl -s -w '\n%{http_code}\n' -H 'Content-Type: application/json' \
  -d '{}' http://127.0.0.1:3002/pedidos
curl -s -w '\n%{http_code}\n' http://127.0.0.1:3002/pedidos/PED-1001
```

**Por qué:** este 404 no es «el pedido no existe». La fila ya está. La proyección todavía no. Eso es consistencia eventual entre el modelo de escritura y el de lectura.

**Resultado esperado:** el POST responde 201 y el JSON del pedido. El GET responde 404 y `aun no proyectado`.

### 4 — Espera y vuelve a leer

**Acción:**

```bash
sleep 2
curl -s -w '\n%{http_code}\n' http://127.0.0.1:3002/pedidos/PED-1001
```

**Por qué:** cuando la proyección ha escrito la clave, la consulta responde. El cliente de Nexo reintenta; no da el pedido por perdido en el primer 404.

**Resultado esperado:** 200 y `{ "id": "PED-1001", "sku": "NX-1", "estado": "aceptado" }`.

### 5 — Mira la fila, que no pasó por Redis

**Acción:**

```bash
docker exec nexo-pg psql -U postgres -d pedidos -c 'select id, estado from pedidos;'
```

**Por qué:** el libro mayor es PostgreSQL. Redis es la copia que lee el GET. Aunque borres la clave, la fila sigue.

**Resultado esperado:** una fila `PED-1001` con estado `aceptado`.

## Comprueba tu entendimiento

**Borrar la proyección no borra el pedido**
```bash
docker exec nexo-redis redis-cli del pedido:PED-1001
curl -s -w '\n%{http_code}\n' http://127.0.0.1:3002/pedidos/PED-1001
```
→ 404. El `select` del paso 5, repetido, sigue mostrando la fila.

## Reto

### 1 — Proyecta otra vez

Sin volver a insertar, vuelve a escribir la clave a partir de la fila y consigue un 200.

<details>
<summary>Ver solución</summary>

En un fichero `reproyectar.mjs`:

```js
import { Sequelize, DataTypes } from 'sequelize';
import Redis from 'ioredis';

const sequelize = new Sequelize('postgres://postgres:nexo@127.0.0.1:5432/pedidos', { logging: false });
const Pedido = sequelize.define('Pedido', {
  id: { type: DataTypes.STRING, primaryKey: true },
  sku: DataTypes.STRING,
  estado: DataTypes.STRING,
}, { tableName: 'pedidos', timestamps: false });
const fila = await Pedido.findByPk('PED-1001');
const redis = new Redis('redis://127.0.0.1:6379');
await redis.set('pedido:PED-1001', JSON.stringify(fila.toJSON()));
await redis.quit();
await sequelize.close();
```

`node reproyectar.mjs` y el GET vuelve a 200. La proyección se puede rehacer desde el modelo de escritura: por eso la fila manda.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| El GET inmediato ya es 200 | Quedó la clave de una ejecución anterior | `docker exec nexo-redis redis-cli del pedido:PED-1001` y repite el POST |
| El GET sigue en 404 después de dos segundos | Redis no es el del lab, o el timeout no se programó | Mira que el POST haya sido 201 y que `redis-cli get pedido:PED-1001` acabe teniendo valor |
| 500 en el POST | Postgres no estaba listo | El `until` de `pg_isready` tiene que haber terminado antes de `node server.mjs` |
