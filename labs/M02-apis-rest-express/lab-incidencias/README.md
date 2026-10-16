# Laboratorio: la API de incidencias

El ejemplo de rutas usa notas y no valida nada. Aquí dejas una API de incidencias. El servidor ya responde `/salud`. Tú creas dos ficheros y añades tres líneas para engancharlos.

### Objetivo

Crear, leer, cambiar y borrar la incidencia `i1`, rechazar un cuerpo malo con 400, un id repetido con 409, y un POST sin clave con 401.

### Punto de partida

```bash
bash scripts/limpiar-entorno.sh
cd labs/M02-apis-rest-express/lab-incidencias
npm install
npm start
```

`curl -s http://127.0.0.1:3001/salud` devuelve `{"ok":true}`. Para el proceso antes de guardar los ficheros nuevos y vuelve a arrancar.

### 1 — Crea `validar.mjs`

**Acción:** crea el fichero `validar.mjs` en esta carpeta y pega esto.

```js
import Joi from 'joi';

const esquema = Joi.object({
  id: Joi.string().required(),
  titulo: Joi.string().min(1).required(),
  gravedad: Joi.string().valid('alta', 'media', 'baja').required(),
});

export function validar(req, res, next) {
  const { error, value } = esquema.validate(req.body, { abortEarly: false, convert: false });
  if (error) {
    next(Object.assign(new Error(error.message), { status: 400 }));
    return;
  }
  req.body = value;
  next();
}
```

**Por qué:** el cuerpo se rechaza antes de entrar en la lista. `convert: false` no convierte la cadena `"30"` en número ni una gravedad desconocida en otra cosa.

**Resultado esperado:** el fichero está al lado de `server.mjs`. Todavía no hay POST.

### 2 — Crea `rutas.mjs`

**Acción:** crea `rutas.mjs` y pega esto.

```js
function apiKey(req, res, next) {
  if (req.header('x-api-key') !== 'lab-incidencias') {
    res.status(401).json({ error: 'falta la clave' });
    return;
  }
  next();
}

export function montar(app, validar, incidencias) {
  app.post('/incidencias', apiKey, validar, (req, res) => {
    if (incidencias.some((item) => item.id === req.body.id)) {
      res.status(409).json({ error: 'id ya existe' });
      return;
    }
    incidencias.push(req.body);
    res.status(201).json(req.body);
  });

  app.get('/incidencias/:id', (req, res) => {
    const item = incidencias.find((incidencia) => incidencia.id === req.params.id);
    if (!item) {
      res.status(404).json({ error: 'no encontrada' });
      return;
    }
    res.json(item);
  });

  app.put('/incidencias/:id', apiKey, validar, (req, res) => {
    const item = incidencias.find((incidencia) => incidencia.id === req.params.id);
    if (!item) {
      res.status(404).json({ error: 'no encontrada' });
      return;
    }
    item.titulo = req.body.titulo;
    item.gravedad = req.body.gravedad;
    res.json(item);
  });

  app.delete('/incidencias/:id', apiKey, (req, res) => {
    const i = incidencias.findIndex((incidencia) => incidencia.id === req.params.id);
    if (i === -1) {
      res.status(404).json({ error: 'no encontrada' });
      return;
    }
    incidencias.splice(i, 1);
    res.status(204).end();
  });
}
```

**Por qué:** escribir exige la clave. Leer no. El GET no pasa por `validar` porque no trae cuerpo.

**Resultado esperado:** `rutas.mjs` está en la carpeta. El servidor, si sigue el de antes, aún no usa estos ficheros.

### 3 — Engánchalos en `server.mjs`

**Acción:** añade estas líneas. El `import` va con los otros import, arriba del todo. `montar(...)` va después de `app.get('/salud', ...)`.

```js
import { validar } from './validar.mjs';
import { montar } from './rutas.mjs';
```

```js
montar(app, validar, incidencias);
```

Reinicia: Ctrl+C y `npm start`.

```bash
curl -s -w '\n%{http_code}\n' -H 'Content-Type: application/json' \
  -d '{"id":"i1","titulo":"","gravedad":"urgente"}' http://127.0.0.1:3001/incidencias
curl -s -w '\n%{http_code}\n' -H 'x-api-key: lab-incidencias' -H 'Content-Type: application/json' \
  -d '{"id":"i1","titulo":"","gravedad":"urgente"}' http://127.0.0.1:3001/incidencias
curl -s -w '\n%{http_code}\n' -H 'x-api-key: lab-incidencias' -H 'Content-Type: application/json' \
  -d '{"id":"i1","titulo":"puerta rota","gravedad":"alta"}' http://127.0.0.1:3001/incidencias
curl -s -w '\n%{http_code}\n' -H 'x-api-key: lab-incidencias' -H 'Content-Type: application/json' \
  -d '{"id":"i1","titulo":"puerta rota","gravedad":"alta"}' http://127.0.0.1:3001/incidencias
curl -s http://127.0.0.1:3001/incidencias/i1; echo
curl -s -X PUT -H 'x-api-key: lab-incidencias' -H 'Content-Type: application/json' \
  -d '{"id":"i1","titulo":"puerta arreglada","gravedad":"baja"}' http://127.0.0.1:3001/incidencias/i1
echo
curl -s -D - -o /dev/null -X DELETE -H 'x-api-key: lab-incidencias' http://127.0.0.1:3001/incidencias/i1
curl -s -w '\n%{http_code}\n' http://127.0.0.1:3001/incidencias/i1
curl -s -w '\n%{http_code}\n' http://127.0.0.1:3001/salud
```

**Por qué:** 400 es un cuerpo que no cumple el esquema. 401 es escribir sin clave. 409 es un id que ya está. 204 es un borrado sin cuerpo.

**Resultado esperado:** 401, 400, 201, 409, el JSON de `i1`, el título `puerta arreglada`, 204, 404 y un 200 de `/salud`.

## Así se ve

401 sin clave, 400 con el cuerpo malo, 201 al crear, 409 al repetir el id, el JSON de `i1`, el título cambiado, 204 al borrar, 404 al volver a leer y 200 en `/salud`.

![resultado del laboratorio](resultado.png)

## Comprueba tu entendimiento

**Un GET con id desconocido no es un 400**
`curl -s -w '\n%{http_code}\n' http://127.0.0.1:3001/incidencias/no-esta`
→ 404.

## Si quieres probar

En `validar.mjs`, cambia `min(1)` por `min(20)`. Reinicia y repite el POST de `puerta rota` con la clave. Tiene que salir 400: el título es corto para ese esquema. Vuelve a dejar `min(1)` si sigues con el resto.

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| `Cannot find module` | Falta `validar.mjs` o `rutas.mjs`, o el `import` no está arriba | Los dos ficheros al lado de `server.mjs`, y los `import` al principio |
| El 400 llega como 500 | El error no lleva `status` | `Object.assign(new Error(...), { status: 400 })` |
| La clave también cierra `/salud` | `apiKey` está en un `app.use` global | Solo va delante de POST, PUT y DELETE, dentro de `montar` |
