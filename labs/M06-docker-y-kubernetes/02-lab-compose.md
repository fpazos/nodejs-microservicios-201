# Docker Compose

[← Página anterior](01-lab-dockerfile.md) · [Siguiente página →](03-lab-kubernetes.md)

Vas a levantar `catalogo` y MongoDB juntos, y a leer `NX-1` de la base, no de un array.

### Objetivo

Que `curl` a `/productos/NX-1` devuelva el documento que un script guardó en MongoDB, con los dos contenedores creados por Compose.

### Punto de partida

```bash
mkdir -p ~/nexo/m06-compose && cd ~/nexo/m06-compose
docker rm -f nexo-catalogo nexo-mongo >/dev/null 2>&1 || true
```

- Docker en marcha. Puerto 3001 y 27017 libres.
- La imagen se construye aquí. No hace falta haber dejado el contenedor del lab anterior.

### En qué consiste

El servidor usa `MONGO_URL`. Compose llama `mongo` al contenedor de la base y le pasa esa URL a `catalogo`.

### 1 — Escribe el servidor

**Acción:** guarda `server.mjs` y `package.json`.

```js
import express from 'express';
import mongoose from 'mongoose';

const url = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/nexo';
await mongoose.connect(url);
const Producto = mongoose.model('Producto', new mongoose.Schema({
  sku: String,
  nombre: String,
  stock: Number,
}));

const app = express();
app.get('/productos/:sku', async (req, res) => {
  const doc = await Producto.findOne({ sku: req.params.sku }).lean();
  if (!doc) {
    res.status(404).json({ error: 'sku no encontrado' });
    return;
  }
  res.json(doc);
});
app.listen(3001, '0.0.0.0', () => console.log('catalogo en 3001'));
```

```json
{
  "name": "catalogo",
  "type": "module",
  "dependencies": {
    "express": "^5.1.0",
    "mongoose": "^8.15.0"
  }
}
```

**Por qué:** dentro de Compose, `127.0.0.1` es el propio contenedor de `catalogo`, donde no hay MongoDB. El nombre `mongo` solo existe en la red que crea Compose.

**Resultado esperado:** los dos ficheros están en la carpeta.

### 2 — Escribe el Dockerfile

**Acción:** guarda `Dockerfile`.

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY server.mjs ./
USER node
EXPOSE 3001
CMD ["node", "server.mjs"]
```

**Por qué:** Compose construye esta imagen con `build: .`. El proceso sigue siendo el usuario `node`.

**Resultado esperado:** `Dockerfile` presente.

### 3 — Escribe el Compose

**Acción:** guarda `docker-compose.yml`.

```yaml
services:
  mongo:
    image: mongo:7
    container_name: nexo-compose-mongo
  catalogo:
    build: .
    container_name: nexo-compose-catalogo
    ports:
      - "3001:3001"
    environment:
      MONGO_URL: mongodb://mongo:27017/nexo
    depends_on:
      - mongo
```

**Por qué:** `MONGO_URL` usa el nombre del servicio, `mongo`, no `localhost`. `depends_on` ordena el arranque; no espera a que MongoDB acepte conexiones. La semilla reintenta por eso.

**Resultado esperado:** `docker-compose.yml` en la carpeta.

### 4 — Levanta los dos

**Acción:**

```bash
docker compose up -d --build
until docker exec nexo-compose-mongo mongosh --quiet --eval 'db.runCommand({ ping: 1 }).ok'; do sleep 2; done
```

**Por qué:** el `until` separa «el contenedor existe» de «ya se puede escribir». Sin eso, la semilla falla y parece un problema de red.

**Resultado esperado:** `mongosh` acaba imprimiendo `1`. `docker compose ps` muestra los dos servicios en marcha.

### 5 — Siembra NX-1 desde la red de Compose

**Acción:** guarda `semilla.mjs` y lánzalo con un contenedor Node efímero en la misma red.

```js
import mongoose from 'mongoose';

await mongoose.connect(process.env.MONGO_URL);
const Producto = mongoose.model('Producto', new mongoose.Schema({
  sku: String,
  nombre: String,
  stock: Number,
}));
await Producto.findOneAndUpdate(
  { sku: 'NX-1' },
  { sku: 'NX-1', nombre: 'Sobre 1 kg', stock: 40 },
  { upsert: true },
);
console.log('semilla lista');
await mongoose.disconnect();
```

```bash
docker run --rm --network "$(basename "$PWD")_default" \
  -e MONGO_URL=mongodb://mongo:27017/nexo \
  -v "$PWD/semilla.mjs":/semilla.mjs:ro \
  node:22-alpine \
  sh -c 'npm install mongoose && node /semilla.mjs'
```

El nombre de la red es el de la carpeta más `_default`. Desde `m06-compose` es `m06-compose_default`.

**Por qué:** la semilla tiene que resolver el nombre `mongo`. En el host ese nombre no existe. El contenedor efímero entra en la red del Compose.

**Resultado esperado:** `semilla lista`.

### 6 — Lee el SKU por el puerto publicado

**Acción:**

```bash
curl -s http://127.0.0.1:3001/productos/NX-1
echo
```

**Por qué:** el host solo ve el puerto 3001. `catalogo` habla con `mongo` por la red interna y devuelve el documento.

**Resultado esperado:** JSON con `sku` `NX-1` y `stock` 40.

## Comprueba tu entendimiento

**El nombre mongo no existe en el host**
```bash
curl -s http://127.0.0.1:3001/productos/NX-9
```
→ 404 y `sku no encontrado`. El proceso responde; ese SKU no se sembró. `getent hosts mongo` en el host no resuelve: el nombre es de la red de Compose.

## Reto

### 1 — Apaga solo la base

Para el servicio `mongo` y vuelve a pedir `NX-1`.

<details>
<summary>Ver solución</summary>

```bash
docker compose stop mongo
curl -s -w '\n%{http_code}\n' http://127.0.0.1:3001/productos/NX-1
```

El `curl` no devuelve el JSON del producto: el servidor pierde la conexión con MongoDB (500 o conexión cortada). `docker compose start mongo` lo recupera. El puerto publicado no basta si el servicio del que depende está parado.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| `getaddrinfo ENOTFOUND mongo` en la semilla | El contenedor no está en la red del Compose | `--network m06-compose_default` (el prefijo es el nombre de la carpeta) |
| 404 en `NX-1` | La semilla no llegó a `semilla lista` | Repite el paso 5 y mira el final del log |
| El catálogo reinicia sin parar | MongoDB aún no aceptaba conexiones al arrancar Node | `docker compose restart catalogo` después del `until` |
