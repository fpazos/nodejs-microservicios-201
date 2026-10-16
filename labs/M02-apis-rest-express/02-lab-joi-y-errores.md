# Joi y errores

[← Página anterior](01-lab-crud-catalogo.md) · [Siguiente página →](03-lab-middleware.md)

Vas a impedir que un alta sin SKU, o con un stock negativo, entre en el catálogo de Nexo, y a devolver el código HTTP que corresponde.

### Objetivo

Dejar un POST que responde 400 cuando el cuerpo no cumple el esquema, 201 cuando cumple, y 404 cuando el GET pide un SKU que no está. Un fallo inesperado responde 500.

### Punto de partida

```bash
mkdir -p ~/nexo/m02-joi && cd ~/nexo/m02-joi
npm init -y
npm pkg set type=module
npm install express@5 joi
```

- Puerto 3001 libre.
- El servidor se escribe entero en esta carpeta. No reutiliza el del lab anterior.

### En qué consiste

Defines un esquema Joi, un middleware que lo aplica y un manejador de errores. Pruebas un cuerpo malo, uno bueno y un SKU ausente.

### 1 — Escribe el servidor con validación

**Acción:** guarda esto como `server.mjs`.

```js
import express from 'express';
import Joi from 'joi';

const app = express();
app.use(express.json());

const productos = [];

const esquema = Joi.object({
  sku: Joi.string().pattern(/^NX-\d+$/).required(),
  nombre: Joi.string().min(1).required(),
  stock: Joi.number().integer().min(0).required(),
});

function validarAlta(req, res, next) {
  const { error, value } = esquema.validate(req.body, { abortEarly: false });
  if (error) {
    next(Object.assign(new Error(error.message), { status: 400 }));
    return;
  }
  req.body = value;
  next();
}

app.post('/productos', validarAlta, (req, res) => {
  if (productos.some((p) => p.sku === req.body.sku)) {
    res.status(409).json({ error: 'sku ya existe' });
    return;
  }
  productos.push(req.body);
  res.status(201).json(req.body);
});

app.get('/productos/:sku', (req, res) => {
  const item = productos.find((p) => p.sku === req.params.sku);
  if (!item) {
    res.status(404).json({ error: 'sku no encontrado' });
    return;
  }
  res.json(item);
});

app.get('/romper', () => {
  throw new Error('fallo de laboratorio');
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ error: err.message });
});

app.listen(3001, () => console.log('catalogo en 3001'));
```

**Por qué:** Joi es el contrato del cuerpo. El middleware de cuatro argumentos es el único sitio que traduce un error a HTTP. Así las rutas no repiten el formato de la respuesta de fallo.

**Resultado esperado:** `server.mjs` en `~/nexo/m02-joi`.

### 2 — Arranca

**Acción:**

```bash
node server.mjs
```

**Por qué:** las pruebas hablan con el puerto 3001.

**Resultado esperado:** `catalogo en 3001`.

### 3 — Manda un cuerpo inválido

**Acción:**

```bash
curl -s -w '\n%{http_code}\n' -H 'Content-Type: application/json' \
  -d '{"sku":"abc","nombre":"","stock":-3}' \
  http://127.0.0.1:3001/productos
```

**Por qué:** ese JSON no es un producto de Nexo. Si respondiera 201, el catálogo guardaría basura y `pedidos` la heredaría.

**Resultado esperado:** HTTP 400 y un mensaje que menciona `sku`, `nombre` y `stock`. No se ha creado ningún producto.

### 4 — Manda el alta buena

**Acción:**

```bash
curl -s -w '\n%{http_code}\n' -H 'Content-Type: application/json' \
  -d '{"sku":"NX-1","nombre":"Sobre 1 kg","stock":40}' \
  http://127.0.0.1:3001/productos
```

**Por qué:** el esquema tiene que dejar pasar el producto real, no solo rechazar.

**Resultado esperado:** 201 y el JSON de `NX-1` con stock 40.

### 5 — Pide un SKU que no existe

**Acción:**

```bash
curl -s -w '\n%{http_code}\n' http://127.0.0.1:3001/productos/NX-9
```

**Por qué:** 404 es «este SKU no está», distinto de 400, que es «no entiendo el cuerpo».

**Resultado esperado:** 404 y `{"error":"sku no encontrado"}`.

### 6 — Provoca un 500

**Acción:**

```bash
curl -s -w '\n%{http_code}\n' http://127.0.0.1:3001/romper
```

**Por qué:** el manejador cubre también el fallo que no es de validación. Express 5 lleva la excepción hasta ese middleware.

**Resultado esperado:** 500 y `{"error":"fallo de laboratorio"}`. La terminal del servidor no se cae.

## Comprueba tu entendimiento

**El segundo alta del mismo SKU no es un 400**
Repite el POST del paso 4.
→ 409 y `{"error":"sku ya existe"}`. El cuerpo era válido; el conflicto es de negocio.

## Reto

### 1 — Stock que llega como texto

Manda `{"sku":"NX-2","nombre":"Caja","stock":"4"}`. Joi, por defecto, convierte la cadena `"4"` en número. Haz que eso sea un 400.

<details>
<summary>Ver solución</summary>

En el `validate`:

```js
const { error, value } = esquema.validate(req.body, {
  abortEarly: false,
  convert: false,
});
```

Reinicia el servidor. El POST con `"stock":"4"` responde 400. El POST con `"stock": 4` numérico responde 201.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| 500 en vez de 400, y el mensaje es de Joi | El error no lleva `status` | `Object.assign(new Error(error.message), { status: 400 })` |
| `Cannot set headers after they are sent` | Hay un `res.json` y después otro, sin `return` | Sal de la función después de responder |
| El 400 no llega y el proceso imprime el error | El manejador tiene 3 argumentos, no 4 | La firma es `(err, req, res, next)` aunque `next` no se use |
