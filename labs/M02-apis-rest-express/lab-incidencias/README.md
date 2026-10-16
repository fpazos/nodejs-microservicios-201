# Laboratorio: la API de incidencias

El ejemplo de rutas usa notas y no valida nada. Aquí dejas una API de incidencias que valida, responde con el código que toca y exige una clave para escribir.

La carpeta ya arranca: `/salud` responde. El resto son los comentarios `TODO` de `server.mjs`.

### Objetivo

Crear, leer, cambiar y borrar la incidencia `i1`, rechazar un cuerpo malo con 400, un id repetido con 409, y un POST sin clave con 401.

### Punto de partida

```bash
bash scripts/limpiar-entorno.sh
cd labs/M02-apis-rest-express/lab-incidencias
npm install
npm start
```

`curl -s http://127.0.0.1:3001/salud` devuelve `{"ok":true}`.

### 1 — Valida el alta

**Acción:** encima de las rutas, declara el esquema y un middleware `validar` que, si Joi falla, llame a `next` con un `Error` y `status: 400`. Usa `convert: false`.

```js
const esquema = Joi.object({
  id: Joi.string().required(),
  titulo: Joi.string().min(1).required(),
  gravedad: Joi.string().valid('alta', 'media', 'baja').required(),
});

function validar(req, res, next) {
  const { error, value } = esquema.validate(req.body, { abortEarly: false, convert: false });
  if (error) {
    next(Object.assign(new Error(error.message), { status: 400 }));
    return;
  }
  req.body = value;
  next();
}
```

**Por qué:** un cuerpo sin título no puede entrar en la lista. El 400 lo pone el middleware de errores que ya está al final del fichero.

**Resultado esperado:** el fichero guarda sin error de sintaxis. Todavía no hay POST.

### 2 — Crea, y no dupliques

**Acción:** añade el POST. Reinicia el servidor (Ctrl+C y `npm start`).

```js
app.post('/incidencias', validar, (req, res) => {
  if (incidencias.some((item) => item.id === req.body.id)) {
    res.status(409).json({ error: 'id ya existe' });
    return;
  }
  incidencias.push(req.body);
  res.status(201).json(req.body);
});
```

```bash
curl -s -w '\n%{http_code}\n' -H 'Content-Type: application/json' \
  -d '{"id":"i1","titulo":"","gravedad":"urgente"}' http://127.0.0.1:3001/incidencias
curl -s -w '\n%{http_code}\n' -H 'Content-Type: application/json' \
  -d '{"id":"i1","titulo":"puerta rota","gravedad":"alta"}' http://127.0.0.1:3001/incidencias
curl -s -w '\n%{http_code}\n' -H 'Content-Type: application/json' \
  -d '{"id":"i1","titulo":"puerta rota","gravedad":"alta"}' http://127.0.0.1:3001/incidencias
```

**Por qué:** 400 es «no entiendo el cuerpo». 409 es «el cuerpo vale y el id ya está». Son fallos distintos.

**Resultado esperado:** 400, luego 201, luego 409.

### 3 — Lee, cambia y borra

**Acción:** añade GET, PUT y DELETE.

```js
app.get('/incidencias/:id', (req, res) => {
  const item = incidencias.find((incidencia) => incidencia.id === req.params.id);
  if (!item) {
    res.status(404).json({ error: 'no encontrada' });
    return;
  }
  res.json(item);
});

app.put('/incidencias/:id', validar, (req, res) => {
  const item = incidencias.find((incidencia) => incidencia.id === req.params.id);
  if (!item) {
    res.status(404).json({ error: 'no encontrada' });
    return;
  }
  item.titulo = req.body.titulo;
  item.gravedad = req.body.gravedad;
  res.json(item);
});

app.delete('/incidencias/:id', (req, res) => {
  const i = incidencias.findIndex((incidencia) => incidencia.id === req.params.id);
  if (i === -1) {
    res.status(404).json({ error: 'no encontrada' });
    return;
  }
  incidencias.splice(i, 1);
  res.status(204).end();
});
```

El PUT exige el cuerpo entero (`id`, `titulo`, `gravedad`) porque reutiliza `validar`. Reinicia.

```bash
curl -s -X PUT -H 'Content-Type: application/json' \
  -d '{"id":"i1","titulo":"puerta arreglada","gravedad":"baja"}' http://127.0.0.1:3001/incidencias/i1
echo
curl -s -D - -o /dev/null -X DELETE http://127.0.0.1:3001/incidencias/i1
curl -s -w '\n%{http_code}\n' http://127.0.0.1:3001/incidencias/i1
```

**Por qué:** PUT no crea otro id. DELETE responde 204, sin cuerpo. El GET siguiente distingue «ya no está» (404) de un fallo del proceso.

**Resultado esperado:** el JSON con `gravedad` `baja`, luego 204, luego 404.

### 4 — La clave solo al escribir

**Acción:** declara `apiKey` y ponlo como argumento en POST, PUT y DELETE, delante de `validar` cuando lo haya.

```js
function apiKey(req, res, next) {
  if (req.header('x-api-key') !== 'lab-incidencias') {
    res.status(401).json({ error: 'falta la clave' });
    return;
  }
  next();
}
```

Reinicia. Crea otra vez `i1` sin clave y con clave. `/salud` sin clave sigue en 200.

```bash
curl -s -w '\n%{http_code}\n' -H 'Content-Type: application/json' \
  -d '{"id":"i1","titulo":"luz","gravedad":"media"}' http://127.0.0.1:3001/incidencias
curl -s -w '\n%{http_code}\n' -H 'x-api-key: lab-incidencias' -H 'Content-Type: application/json' \
  -d '{"id":"i1","titulo":"luz","gravedad":"media"}' http://127.0.0.1:3001/incidencias
```

**Por qué:** la salud la mira quien opera el proceso, sin secreto. Escribir la lista no.

**Resultado esperado:** 401 y después 201.

## Comprueba tu entendimiento

**Un GET con id desconocido no es un 400**
`curl -s -w '\n%{http_code}\n' http://127.0.0.1:3001/incidencias/no-esta`
→ 404.

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| El 400 llega como 500 | El error no lleva `status` | `Object.assign(new Error(...), { status: 400 })` |
| `Cannot set headers after they are sent` | Falta el `return` después de responder | Sal de la función tras `res.status` |
| La clave también cierra `/salud` | `app.use(apiKey)` global | Pasa `apiKey` solo en POST, PUT y DELETE |
