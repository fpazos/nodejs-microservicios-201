# PostgreSQL y Sequelize

[← Página anterior](01-lab-mongodb-mongoose.md) · [Siguiente página →](03-lab-redis-cache.md)

Vas a dejar el pedido `PED-1001` en una tabla de PostgreSQL y a leer esa fila con Sequelize.

### Objetivo

Imprimir `{ id: 'PED-1001', sku: 'NX-1', estado: 'aceptado' }` desde `findByPk`, con el proceso de alta ya cerrado.

### Punto de partida

```bash
mkdir -p ~/nexo/m04-pg && cd ~/nexo/m04-pg
npm init -y
npm pkg set type=module
npm install sequelize pg
docker rm -f nexo-pg >/dev/null 2>&1 || true
docker run -d --name nexo-pg \
  -e POSTGRES_PASSWORD=nexo \
  -e POSTGRES_DB=pedidos \
  -p 5432:5432 postgres:16
until docker exec nexo-pg pg_isready -U postgres; do sleep 2; done
```

- Conexión: `postgres://postgres:nexo@127.0.0.1:5432/pedidos`.
- `pg_isready` tiene que decir `accepting connections` antes de seguir.

### En qué consiste

Defines el modelo, sincronizas la tabla, grabas la fila y la lees en otro fichero.

### 1 — Escribe el modelo compartido

**Acción:** guarda `modelo.mjs`.

```js
import { Sequelize, DataTypes } from 'sequelize';

export const sequelize = new Sequelize('postgres://postgres:nexo@127.0.0.1:5432/pedidos', {
  logging: false,
});

export const Pedido = sequelize.define('Pedido', {
  id: { type: DataTypes.STRING, primaryKey: true },
  sku: DataTypes.STRING,
  estado: DataTypes.STRING,
}, { tableName: 'pedidos', timestamps: false });
```

**Por qué:** `pedidos` es una fila con clave, no un documento. Sequelize concentra el mapeo; los dos programas importan el mismo modelo para no describir la tabla dos veces dentro de esta página.

**Resultado esperado:** `modelo.mjs` creado.

### 2 — Escribe el alta

**Acción:** guarda `alta.mjs`.

```js
import { sequelize, Pedido } from './modelo.mjs';

await sequelize.sync();
await Pedido.upsert({ id: 'PED-1001', sku: 'NX-1', estado: 'aceptado' });
const fila = await Pedido.findByPk('PED-1001');
console.log(fila.toJSON());
await sequelize.close();
```

**Por qué:** `sync` crea la tabla en este laboratorio de un nodo. `upsert` permite repetir el lab sin chocar con la clave primaria.

**Resultado esperado:** `alta.mjs` creado.

### 3 — Graba el pedido

**Acción:**

```bash
node alta.mjs
```

**Por qué:** la fila tiene que quedar confirmada en PostgreSQL antes de abrir el otro proceso.

**Resultado esperado:** `{ id: 'PED-1001', sku: 'NX-1', estado: 'aceptado' }`.

### 4 — Léelo desde otro proceso

**Acción:** guarda `lectura.mjs` y ejecútalo.

```js
import { sequelize, Pedido } from './modelo.mjs';

const fila = await Pedido.findByPk('PED-1001');
console.log(fila.toJSON());
await sequelize.close();
```

```bash
node lectura.mjs
```

**Por qué:** la lectura no llama a `sync` ni a `upsert`. Solo pregunta. Es el GET que serviría el estado si leyera la tabla directamente.

**Resultado esperado:** el mismo objeto, con `estado` `aceptado`.

## Comprueba tu entendimiento

**La tabla se llama pedidos**
```bash
docker exec nexo-pg psql -U postgres -d pedidos -c 'select id, sku, estado from pedidos;'
```
→ Una fila: `PED-1001`, `NX-1`, `aceptado`.

## Reto

### 1 — Pasa el pedido a en-reparto

Actualiza la fila y vuelve a leerla.

<details>
<summary>Ver solución</summary>

```js
await Pedido.update({ estado: 'en-reparto' }, { where: { id: 'PED-1001' } });
```

Puedes ponerlo en `alta.mjs` antes de `close`, o en un tercer fichero que importe el modelo. Después de ejecutarlo, `node lectura.mjs` imprime `estado` `en-reparto`.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| `ECONNREFUSED` | Postgres aún no acepta conexiones | Repite el `until` con `pg_isready` |
| `password authentication failed` | La URL no lleva `nexo` | `postgres://postgres:nexo@127.0.0.1:5432/pedidos` |
| `findByPk` devuelve `null` | El alta no se ejecutó, o la base no es `pedidos` | Corre `node alta.mjs` y mira el `select` del comprueba |
