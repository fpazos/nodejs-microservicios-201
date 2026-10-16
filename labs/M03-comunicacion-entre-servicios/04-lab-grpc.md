# gRPC

[← Página anterior](03-lab-kafka.md) · [Siguiente página →](05-lab-websockets.md)

Vas a preguntar el producto `NX-1` a `catalogo` con un RPC y a ver la misma respuesta por un GET, para contrastar los dos contratos.

### Objetivo

Recibir `{ sku: 'NX-1', nombre: 'Sobre 1 kg', stock: 40 }` desde un cliente gRPC y el mismo dato en JSON por el puerto 3001.

### Punto de partida

```bash
mkdir -p ~/nexo/m03-grpc && cd ~/nexo/m03-grpc
npm init -y
npm pkg set type=module
npm install @grpc/grpc-js @grpc/proto-loader express@5
```

- Puertos 50051 y 3001 libres.
- No depende de la cola del lab anterior.

### En qué consiste

Defines `GetProducto` en un `.proto`, sirves esa llamada y un GET con el mismo contenido, y lanzas el cliente.

### 1 — Escribe el contrato

**Acción:** guarda `catalogo.proto`.

```protobuf
syntax = "proto3";
package nexo;

service Catalogo {
  rpc GetProducto (ProductoId) returns (Producto);
}

message ProductoId {
  string sku = 1;
}

message Producto {
  string sku = 1;
  string nombre = 2;
  int32 stock = 3;
}
```

**Por qué:** este fichero es el contrato que compartirían `pedidos` y `catalogo`. En REST el contrato es el camino `/productos/NX-1` y el JSON; aquí el contrato es el mensaje `Producto`.

**Resultado esperado:** `catalogo.proto` en la carpeta.

### 2 — Escribe el servidor

**Acción:** guarda `servidor.mjs`.

```js
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import express from 'express';

const def = protoLoader.loadSync('./catalogo.proto', {
  keepCase: true,
  longs: String,
  defaults: true,
});
const proto = grpc.loadPackageDefinition(def).nexo;

const producto = { sku: 'NX-1', nombre: 'Sobre 1 kg', stock: 40 };

const grpcServer = new grpc.Server();
grpcServer.addService(proto.Catalogo.service, {
  GetProducto: (call, callback) => {
    if (call.request.sku !== producto.sku) {
      callback({ code: grpc.status.NOT_FOUND, message: 'sku no encontrado' });
      return;
    }
    callback(null, producto);
  },
});

await new Promise((resolve, reject) => {
  grpcServer.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), (err) => {
    if (err) reject(err);
    else resolve();
  });
});
console.log('grpc en 50051');

const app = express();
app.get('/productos/:sku', (req, res) => {
  if (req.params.sku !== producto.sku) {
    res.status(404).json({ error: 'sku no encontrado' });
    return;
  }
  res.json(producto);
});
app.listen(3001, () => console.log('rest en 3001'));
```

**Por qué:** los dos canales leen el mismo objeto. Así la comparación es de contrato y de transporte, no de datos distintos. El laboratorio usa un canal sin TLS; el cifrado del cable está en el módulo de seguridad.

**Resultado esperado:** `servidor.mjs` creado.

### 3 — Escribe el cliente gRPC

**Acción:** guarda `cliente.mjs`.

```js
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';

const def = protoLoader.loadSync('./catalogo.proto', { keepCase: true, longs: String, defaults: true });
const proto = grpc.loadPackageDefinition(def).nexo;
const cliente = new proto.Catalogo('127.0.0.1:50051', grpc.credentials.createInsecure());

cliente.GetProducto({ sku: 'NX-1' }, (err, respuesta) => {
  if (err) {
    console.error(err.message);
    process.exit(1);
  }
  console.log(respuesta);
  process.exit(0);
});
```

**Por qué:** `pedidos` no haría un `curl`: llamaría a esta función y seguiría con el stock.

**Resultado esperado:** `cliente.mjs` creado.

### 4 — Arranca el servidor

**Acción:**

```bash
node servidor.mjs
```

**Por qué:** el cliente necesita los dos puertos.

**Resultado esperado:** `grpc en 50051` y `rest en 3001`.

### 5 — Llama por gRPC y por REST

**Acción:** en otra terminal, desde `~/nexo/m03-grpc`,

```bash
node cliente.mjs
curl -s http://127.0.0.1:3001/productos/NX-1
echo
```

**Por qué:** los dos tienen que devolver el mismo stock. gRPC no cambia el negocio: cambia cómo está escrito el contrato y cómo viaja.

**Resultado esperado:** el cliente imprime un objeto con `sku` `NX-1`, `nombre` `Sobre 1 kg` y `stock` 40. El `curl` imprime el JSON equivalente.

## Comprueba tu entendimiento

**Un SKU desconocido no es un 200**
`curl -s -w '\n%{http_code}\n' http://127.0.0.1:3001/productos/NX-9`
→ 404 y `sku no encontrado`.

## Reto

### 1 — El RPC del SKU que no está

Pide `NX-9` desde el cliente gRPC.

<details>
<summary>Ver solución</summary>

En `cliente.mjs`, cambia el argumento a `{ sku: 'NX-9' }`. La salida es el mensaje `sku no encontrado` y el proceso termina con código 1. En REST eso fue un 404; aquí es el estado `NOT_FOUND` de gRPC.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| `No address added out of total 1 resolved` | El servidor no está, o el puerto no es 50051 | Mira la terminal del servidor |
| `Cannot find module './catalogo.proto'` | El `node` se lanzó desde otra carpeta | `cd ~/nexo/m03-grpc` |
| El cliente imprime `undefined` | El `package` del `.proto` no es `nexo` | La primera línea de paquete tiene que ser `package nexo;` |
