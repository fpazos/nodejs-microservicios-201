# Rutas Express

[← Página anterior](README.md) · [Siguiente página →](01-lab-crud-catalogo.md)

El catálogo de Nexo expone el SKU `NX-1`, «Sobre 1 kg», con stock 40. Express une cada verbo HTTP con un controlador. El controlador lee el cuerpo o el parámetro y escribe el estado y el JSON.

## Punto de partida

```bash
mkdir -p ~/nexo/m02-demo && cd ~/nexo/m02-demo
npm init -y
npm install express@5
```

- Node.js 22.
- Puerto 3001 libre.
- El fichero de esta página es `server.mjs`, creado aquí. No depende de M01.

En `package.json`, el campo `"type"` queda en `"module"` con este comando:

```bash
npm pkg set type=module
```

## Recorrido

1. `server.mjs` guarda los productos en memoria y declara cuatro rutas más una de salud.

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

2. Al arrancar con `node server.mjs`, la terminal escribe `catalogo en 3001`. Un GET a `http://127.0.0.1:3001/productos` devuelve `[]`: el array acaba de nacer.

3. Un POST a `/productos` con cuerpo `{"sku":"NX-1","nombre":"Sobre 1 kg","stock":40}` devuelve 201 y el mismo objeto. El controlador ha hecho de alta. A partir de ahí, GET `/productos` devuelve un array de un elemento y GET `/productos/NX-1` devuelve ese objeto.

4. GET `/productos/NX-9` no encuentra fila y responde 404 con `{"error":"sku no encontrado"}`. El código dice que el contrato se ha cumplido: la ruta existe, el SKU no.

5. PUT `/productos/NX-1` con `{"nombre":"Sobre 1 kg","stock":35}` sustituye el stock. DELETE `/productos/NX-1` responde 204 sin cuerpo, y el GET siguiente de ese SKU vuelve a 404.

6. La ruta y el controlador están en la misma función. En un fichero más grande el controlador se exporta aparte; el contrato HTTP no cambia.

## Qué queda visto

El catálogo ya tiene verbo, camino y código. Todavía acepta un cuerpo vacío y responde 201: la validación está en [02 — Joi y errores](02-lab-joi-y-errores.md). El laboratorio [01 — CRUD del catálogo](01-lab-crud-catalogo.md) reconstruye este servidor y añade un handler que espera sin tapar `/salud`.
