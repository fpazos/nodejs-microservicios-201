# Redis como caché

[← Página anterior](02-lab-postgres-sequelize.md) · [Siguiente página →](04-lab-cqrs.md)

Vas a servir el stock de `NX-1` desde Redis en la segunda lectura, y a comprobar que esa lectura sigue viva aunque MongoDB se pare.

### Objetivo

Ver en el log una lectura `mongo` y otra `redis`, y recibir el stock desde Redis con el contenedor de MongoDB parado.

### Punto de partida

```bash
mkdir -p ~/nexo/m04-cache && cd ~/nexo/m04-cache
npm init -y
npm pkg set type=module
npm install mongoose ioredis express@5
docker rm -f nexo-mongo nexo-redis >/dev/null 2>&1 || true
docker run -d --name nexo-mongo -p 27017:27017 mongo:7
docker run -d --name nexo-redis -p 6379:6379 redis:7
until docker exec nexo-mongo mongosh --quiet --eval 'db.runCommand({ ping: 1 }).ok'; do sleep 2; done
until docker exec nexo-redis redis-cli ping | grep -q PONG; do sleep 1; done
```

- MongoDB en `mongodb://127.0.0.1:27017/nexo`.
- Redis en `127.0.0.1:6379`, sin clave.
- Puerto 3001 libre.

### En qué consiste

El GET mira la clave `stock:NX-1`. Si no está, lee MongoDB, guarda la clave 60 segundos y responde. El segundo GET no abre MongoDB.

### 1 — Siembra el documento

**Acción:** guarda `semilla.mjs` y ejecútalo.

```js
import mongoose from 'mongoose';

await mongoose.connect('mongodb://127.0.0.1:27017/nexo');
const Producto = mongoose.model('Producto', new mongoose.Schema({
  sku: { type: String, unique: true },
  nombre: String,
  stock: Number,
}));
await Producto.findOneAndUpdate(
  { sku: 'NX-1' },
  { sku: 'NX-1', nombre: 'Sobre 1 kg', stock: 40 },
  { upsert: true },
);
await mongoose.disconnect();
console.log('semilla lista');
```

```bash
node semilla.mjs
```

**Por qué:** la caché no inventa el stock. Tiene que haber un documento del que copiarlo la primera vez.

**Resultado esperado:** `semilla lista`.

### 2 — Escribe el API con caché

**Acción:** guarda `server.mjs`.

```js
import express from 'express';
import mongoose from 'mongoose';
import Redis from 'ioredis';

await mongoose.connect('mongodb://127.0.0.1:27017/nexo');
const Producto = mongoose.model('Producto', new mongoose.Schema({
  sku: String,
  nombre: String,
  stock: Number,
}));
const redis = new Redis('redis://127.0.0.1:6379');
const app = express();

app.get('/productos/:sku', async (req, res) => {
  const clave = `stock:${req.params.sku}`;
  const cacheado = await redis.get(clave);
  if (cacheado) {
    console.log('redis', clave);
    res.json(JSON.parse(cacheado));
    return;
  }
  const doc = await Producto.findOne({ sku: req.params.sku }).lean();
  if (!doc) {
    res.status(404).json({ error: 'sku no encontrado' });
    return;
  }
  console.log('mongo', clave);
  await redis.set(clave, JSON.stringify(doc), 'EX', 60);
  res.json(doc);
});

app.listen(3001, () => console.log('catalogo en 3001'));
```

**Por qué:** este es el patrón de caché de lectura. La clave caduca a los 60 segundos para que un stock viejo no se quede para siempre. En Nexo, un cambio de stock tendría además que borrar la clave; el reto lo hace.

**Resultado esperado:** `server.mjs` creado.

### 3 — Arranca y pide el SKU dos veces

**Acción:**

```bash
node server.mjs
```

En otra terminal:

```bash
curl -s http://127.0.0.1:3001/productos/NX-1; echo
curl -s http://127.0.0.1:3001/productos/NX-1; echo
```

**Por qué:** la primera vez no hay clave. La segunda no debe tocar MongoDB.

**Resultado esperado:** los dos cuerpos traen `stock` 40. En la terminal del servidor, la primera línea es `mongo stock:NX-1` y la segunda `redis stock:NX-1`.

### 4 — Para MongoDB y vuelve a leer

**Acción:**

```bash
docker stop nexo-mongo
curl -s http://127.0.0.1:3001/productos/NX-1; echo
```

**Por qué:** demuestra que la respuesta sale de Redis. También enseña el límite: si la clave caduca o se borra, con MongoDB parado el GET ya no puede rellenar la caché.

**Resultado esperado:** el JSON de `NX-1` y, en el servidor, otra línea `redis stock:NX-1`.

## Comprueba tu entendimiento

**La clave tiene caducidad**
```bash
docker start nexo-redis
docker exec nexo-redis redis-cli ttl stock:NX-1
```
→ Un entero entre 1 y 60. No es `-1` (eso sería una clave sin caducidad).

## Reto

### 1 — Invalida al cambiar el stock

Después de un `update` del documento a stock 35, borra `stock:NX-1` para que el siguiente GET vuelva a MongoDB.

<details>
<summary>Ver solución</summary>

Con MongoDB otra vez en marcha (`docker start nexo-mongo`) y el servidor reiniciado:

```js
await Producto.updateOne({ sku: 'NX-1' }, { stock: 35 });
await redis.del('stock:NX-1');
```

El siguiente `curl` a `/productos/NX-1` imprime `stock` 35 y el log vuelve a decir `mongo`.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| Las dos lecturas dicen `mongo` | Redis no se escribió, o son SKU distintos | `docker exec nexo-redis redis-cli get stock:NX-1` tiene que devolver JSON |
| El paso 4 responde 500 | La clave no estaba y MongoDB ya está parado | Repite los dos `curl` del paso 3 antes de `docker stop` |
| `NOAUTH` | Estás apuntando a otro Redis con clave | La URL del lab es `redis://127.0.0.1:6379` |
