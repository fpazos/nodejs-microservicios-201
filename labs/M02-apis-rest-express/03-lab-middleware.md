# Middleware

[← Página anterior](02-lab-joi-y-errores.md) · [Siguiente página →](../M03-comunicacion-entre-servicios/README.md)

Vas a poner delante del catálogo tres piezas que Nexo necesita para operarlo: un registro de cada petición, la respuesta comprimida y una clave de laboratorio en las rutas de producto.

### Objetivo

Dejar `/productos` inaccesible sin la cabecera `x-api-key: nexo-lab`, con una línea de log por petición y con el listado servido en gzip cuando el cliente lo acepta.

### Punto de partida

```bash
mkdir -p ~/nexo/m02-middleware && cd ~/nexo/m02-middleware
npm init -y
npm pkg set type=module
npm install express@5 morgan compression
```

- Puerto 3001 libre.
- Servidor nuevo en esta carpeta.

### En qué consiste

Encadenas morgan, compression y la API key. Compruebas el 401, el 200 con la clave, la línea de log y el gzip.

### 1 — Escribe el servidor

**Acción:** guarda esto como `server.mjs`.

```js
import express from 'express';
import morgan from 'morgan';
import compression from 'compression';

const app = express();
app.use(morgan('tiny'));
app.use(compression());
app.use(express.json());

const productos = [
  { sku: 'NX-1', nombre: 'Sobre 1 kg', stock: 40 },
];

function apiKey(req, res, next) {
  if (req.header('x-api-key') !== 'nexo-lab') {
    res.status(401).json({ error: 'falta la clave de laboratorio' });
    return;
  }
  next();
}

app.get('/salud', (req, res) => {
  res.json({ ok: true });
});

app.get('/productos', apiKey, (req, res) => {
  res.json(productos);
});

app.listen(3001, () => console.log('catalogo en 3001'));
```

**Por qué:** el orden importa. El log y la compresión ven todas las rutas. La clave solo protege `/productos`: la salud tiene que poder mirarse sin secreto, o el balanceador no sabrá si el proceso vive.

**Resultado esperado:** `server.mjs` listo.

### 2 — Arranca y mira la salud sin clave

**Acción:**

```bash
node server.mjs
```

En otra terminal:

```bash
curl -s -w '\n%{http_code}\n' http://127.0.0.1:3001/salud
```

**Por qué:** separa «el proceso responde» de «el llamante está autorizado».

**Resultado esperado:** `{"ok":true}` y 200. En la terminal del servidor, una línea de morgan con `GET /salud` y el código 200.

### 3 — Pide el catálogo sin clave

**Acción:**

```bash
curl -s -w '\n%{http_code}\n' http://127.0.0.1:3001/productos
```

**Por qué:** sin el portero, cualquiera que llegue al puerto lee el stock.

**Resultado esperado:** 401 y `{"error":"falta la clave de laboratorio"}`. Morgan anota el 401.

### 4 — Pide el catálogo con la clave

**Acción:**

```bash
curl -s -w '\n%{http_code}\n' -H 'x-api-key: nexo-lab' \
  http://127.0.0.1:3001/productos
```

**Por qué:** la clave de laboratorio es el mecanismo de este módulo. JWT llega más adelante; el hueco del middleware es el mismo.

**Resultado esperado:** 200 y un array con `NX-1`.

### 5 — Pide el catálogo comprimido

**Acción:**

```bash
curl -s -D - -o /tmp/nexo-gzip.bin -H 'x-api-key: nexo-lab' \
  -H 'Accept-Encoding: gzip' \
  http://127.0.0.1:3001/productos
echo
file /tmp/nexo-gzip.bin
```

**Por qué:** un listado grande de SKU no tiene por qué viajar sin comprimir. `compression` negocia gzip si el cliente lo anuncia.

**Resultado esperado:** la cabecera `Content-Encoding: gzip`. `file` describe el fichero como gzip. Para leerlo: `gzip -dc /tmp/nexo-gzip.bin`.

> [!TIP]
> Con un JSON tan corto, algunos `curl` muestran el cuerpo ya descomprimido si usas `--compressed`. Por eso este paso guarda el binario y lo identifica con `file`.

## Comprueba tu entendimiento

**La clave no abre la salud, porque la salud no la pide**
`curl -s -H 'x-api-key: otra' http://127.0.0.1:3001/salud`
→ 200 y `{"ok":true}`. La cabecera sobra y no estorba: esa ruta no usa `apiKey`.

## Reto

### 1 — La clave también en el alta

Añade un POST `/productos` que exija la misma clave y responda 201 con el cuerpo `{ "sku": "NX-2", "nombre": "Caja", "stock": 1 }`.

<details>
<summary>Ver solución</summary>

```js
app.post('/productos', apiKey, (req, res) => {
  productos.push(req.body);
  res.status(201).json(req.body);
});
```

Reinicia el servidor. Sin cabecera, el POST responde 401. Con `-H 'x-api-key: nexo-lab'` y el JSON, responde 201.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| 401 también en `/salud` | `app.use(apiKey)` global, en vez de ponerlo en la ruta | Pasa `apiKey` solo como argumento de `/productos` |
| No aparece `Content-Encoding` | Falta `Accept-Encoding: gzip`, o el middleware está después de la ruta | `compression()` va antes de las rutas |
| No hay líneas de log | morgan está después de las rutas y la respuesta ya salió | `app.use(morgan('tiny'))` el primero |
