# CRUD del catálogo

[← Página anterior](00-rutas-express.md) · [Siguiente página →](02-lab-joi-y-errores.md)

Vas a publicar el catálogo de Nexo en el puerto 3001 y a comprobar los cuatro verbos, más una consulta de stock que espera sin impedir la salud.

### Objetivo

Dejar `NX-1` creado, actualizado y borrado por HTTP, y ver que `/salud` responde mientras `/productos/NX-1/plazo` sigue pendiente.

### Punto de partida

```bash
mkdir -p ~/nexo/m02-crud && cd ~/nexo/m02-crud
npm init -y
npm pkg set type=module
npm install express@5
```

- Puerto 3001 libre.
- El servidor de esta página se escribe aquí entero.

### En qué consiste

Creas `server.mjs`, lo arrancas y recorres POST, GET, PUT, DELETE y el handler asíncrono del plazo.

### 1 — Escribe el servidor

**Acción:** guarda esto como `server.mjs`.

```js
import express from 'express';

const app = express();
app.use(express.json());

const productos = [];

app.get('/salud', (req, res) => {
  res.json({ ok: true });
});

app.get('/productos', (req, res) => {
  res.json(productos);
});

app.get('/productos/:sku', (req, res) => {
  const item = productos.find((p) => p.sku === req.params.sku);
  if (!item) {
    res.status(404).json({ error: 'sku no encontrado' });
    return;
  }
  res.json(item);
});

app.get('/productos/:sku/plazo', async (req, res) => {
  await new Promise((resolve) => setTimeout(resolve, 3000));
  res.json({ sku: req.params.sku, plazo: '24h' });
});

app.post('/productos', (req, res) => {
  const item = { sku: req.body.sku, nombre: req.body.nombre, stock: req.body.stock };
  productos.push(item);
  res.status(201).json(item);
});

app.put('/productos/:sku', (req, res) => {
  const item = productos.find((p) => p.sku === req.params.sku);
  if (!item) {
    res.status(404).json({ error: 'sku no encontrado' });
    return;
  }
  item.nombre = req.body.nombre;
  item.stock = req.body.stock;
  res.json(item);
});

app.delete('/productos/:sku', (req, res) => {
  const i = productos.findIndex((p) => p.sku === req.params.sku);
  if (i === -1) {
    res.status(404).json({ error: 'sku no encontrado' });
    return;
  }
  productos.splice(i, 1);
  res.status(204).end();
});

app.listen(3001, () => console.log('catalogo en 3001'));
```

**Por qué:** este es el contrato del catálogo. El GET del plazo simula al transportista: suelta el hilo tres segundos y Express sigue aceptando `/salud`.

**Resultado esperado:** `server.mjs` está en la carpeta y `node_modules/express` existe.

### 2 — Arranca el catálogo

**Acción:**

```bash
node server.mjs
```

**Por qué:** el resto de pasos hablan con el puerto 3001.

**Resultado esperado:** `catalogo en 3001`. Deja esa terminal abierta.

### 3 — Crea el SKU

**Acción:** en otra terminal,

```bash
curl -s -D - -o /tmp/nexo-post.json \
  -H 'Content-Type: application/json' \
  -d '{"sku":"NX-1","nombre":"Sobre 1 kg","stock":40}' \
  http://127.0.0.1:3001/productos
echo
cat /tmp/nexo-post.json
```

**Por qué:** el alta es el POST. El 201 dice que el recurso acaba de nacer, no que ya existiera.

**Resultado esperado:** la cabecera `HTTP/1.1 201 Created` y un JSON con `sku` `NX-1`, `nombre` `Sobre 1 kg` y `stock` 40.

### 4 — Léelo

**Acción:**

```bash
curl -s http://127.0.0.1:3001/productos/NX-1
```

**Por qué:** el GET de un SKU es la consulta que hará `pedidos` antes de aceptar un envío.

**Resultado esperado:** el mismo JSON, con stock 40.

### 5 — Cambia el stock

**Acción:**

```bash
curl -s -X PUT -H 'Content-Type: application/json' \
  -d '{"nombre":"Sobre 1 kg","stock":35}' \
  http://127.0.0.1:3001/productos/NX-1
```

**Por qué:** una salida de almacén no crea otro SKU: sustituye el estado del que ya existe.

**Resultado esperado:** JSON con `stock` 35.

### 6 — Pide el plazo y la salud a la vez

**Acción:**

```bash
curl -s -w '\n%{time_total}s plazo\n' http://127.0.0.1:3001/productos/NX-1/plazo &
curl -s -w '\n%{time_total}s salud\n' http://127.0.0.1:3001/salud &
wait
```

**Por qué:** el controlador del plazo es `async` y espera con `await`. Esa espera es de red, no de CPU. La salud del catálogo tiene que seguir viva.

**Resultado esperado:** `{"ok":true}` con un tiempo bajo, y después `{"sku":"NX-1","plazo":"24h"}` cerca de los tres segundos.

### 7 — Borra el SKU y comprueba el 404

**Acción:**

```bash
curl -s -D - -o /dev/null -X DELETE http://127.0.0.1:3001/productos/NX-1
curl -s -D - -o /dev/null http://127.0.0.1:3001/productos/NX-1
```

**Por qué:** el 204 cierra el borrado sin cuerpo. El 404 siguiente demuestra que el controlador distingue «no está» de «el servidor ha fallado».

**Resultado esperado:** primero `HTTP/1.1 204 No Content`. Después `HTTP/1.1 404 Not Found`.

## Comprueba tu entendimiento

**La lista refleja el alta**
Crea otra vez `NX-1` con el POST del paso 3 y ejecuta `curl -s http://127.0.0.1:3001/productos`.
→ Un array con un objeto. `sku` es `NX-1`.

## Reto

### 1 — No dupliques el SKU

El POST actual inserta aunque `NX-1` ya exista. Haz que el segundo POST responda 409 con `{"error":"sku ya existe"}`.

<details>
<summary>Ver solución</summary>

Dentro de `app.post('/productos', …)`, antes del `push`:

```js
if (productos.some((p) => p.sku === req.body.sku)) {
  res.status(409).json({ error: 'sku ya existe' });
  return;
}
```

Reinicia `node server.mjs`. El primer POST de `NX-1` sigue en 201. El segundo responde 409 y el mensaje `sku ya existe`.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| `Cannot find package 'express'` | El `npm install` se hizo en otra carpeta | `cd ~/nexo/m02-crud` e instala otra vez |
| `SyntaxError` al importar | Falta `"type": "module"` | `npm pkg set type=module` |
| 404 en POST | La URL es `/producto` en singular | Usa `/productos` |
| `/salud` tarda 3 s | Está corriendo el servidor del módulo 1, el del bucle | Para ese proceso y arranca este `server.mjs` |
