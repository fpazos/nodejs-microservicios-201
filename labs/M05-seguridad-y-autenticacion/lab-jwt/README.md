# Laboratorio: quién cambia la receta

El ejemplo de JWT ya separa a quien puede cambiar el artículo de quien solo puede leerlo. Aquí cualquiera lee y cambia el plato. `jsonwebtoken` está instalado, el secreto es `secreto-recetas`, `noa` es `chef`, `ian` es `comensal` y la clave de los dos es `lab`. Primero el servidor firma el rol y lo pruebas con un login. Después cierras la lectura. Al final el PUT solo deja pasar al chef.

El login, el GET y el PUT, con su status y su JSON, están en [contrato.json](contrato.json).

### Objetivo

`noa` cambia el plato (200). `ian` recibe 403. Sin token, el GET responde 401.

### Punto de partida

```bash
cd labs/M05-seguridad-y-autenticacion/lab-jwt
npm install
npm start
```

```bash
curl -s -X PUT -H 'Content-Type: application/json' -d '{"plato":"pescado"}' http://127.0.0.1:3001/recetas/r1
echo
```

200 y `plato` `pescado`. No hay identidad.

Al guardar `server.mjs`, o un fichero que ya importe, el proceso se recarga solo. No hace falta Ctrl+C ni volver a lanzar `npm start`. `plato` vuelve a `sopa`. Si el paso depende del plato que acabas de dejar, repite los curl de ese paso después del guardado.

Las mismas peticiones están en `peticiones.http`. Ábrelo y pulsa Send Request encima de la que quieras (extensión REST Client). Si la cabecera lleva un token, envía antes el login que tiene nombre: la siguiente petición usa esa respuesta.

### 1 — Firmar el rol

**Acción:** crea `sesion.mjs` solo con el login. `exigir` llega en el paso siguiente.

```js
import jwt from 'jsonwebtoken';

// El secreto firma. Quien no lo tiene puede leer el payload y no puede
// fabricar un token que verify acepte. El rol sale de esta tabla:
// el cliente manda sub y clave, no el rol.
const SECRETO = 'secreto-recetas';
const cuentas = { noa: 'chef', ian: 'comensal' };

export function montarSesion(app) {
  app.post('/sesion', (req, res) => {
    const rol = cuentas[req.body.sub];
    if (!rol || req.body.clave !== 'lab') {
      res.status(401).json({ error: 'credenciales' });
      return;
    }
    // El token dura quince minutos. Dentro van el sub y el rol que acaba
    // de resolver el servidor al reconocer la cuenta.
    const token = jwt.sign({ sub: req.body.sub, rol }, SECRETO, { expiresIn: '15m' });
    res.json({ token });
  });
}
```

En `server.mjs`, añade el import arriba y llama a `montarSesion(app)` después de `app.use(express.json())` y antes de las rutas. El cuerpo del POST se lee gracias a ese `json()`. El GET y el PUT se quedan como están.

```js
// montarSesion añade POST /sesion. Las rutas de la receta, debajo, siguen abiertas.
import { montarSesion } from './sesion.mjs';
```

```js
// Después de express.json(), para que este POST pueda leer sub y clave.
montarSesion(app);
```

Guarda. `plato` vuelve a `sopa`.

```bash
curl -s -w '\n%{http_code}\n' -H 'Content-Type: application/json' \
  -d '{"sub":"noa","clave":"no"}' http://127.0.0.1:3001/sesion
curl -s -H 'Content-Type: application/json' \
  -d '{"sub":"noa","clave":"lab"}' http://127.0.0.1:3001/sesion
echo
curl -s -w '\n%{http_code}\n' -X PUT -H 'Content-Type: application/json' \
  -d '{"plato":"pescado"}' http://127.0.0.1:3001/recetas/r1
```

**Por qué:** el rol lo pone el servidor al conocer la cuenta. Las rutas de la receta todavía no miran el token: el PUT de abajo entra sin cabecera.

**Resultado esperado:** 401 `{"error":"credenciales"}`, un JSON con `token` (tres tramos separados por puntos) y un 200 del PUT con `pescado`.

### 2 — Cerrar la lectura

**Acción:** al final de `sesion.mjs`, pega `exigir`.

```js
// exigir() sin argumento solo comprueba la firma. exigir('chef') además
// compara el rol del payload. 403 es «sé quién eres y esta ruta no es
// para tu rol». 401 es «no sé quién eres».
export function exigir(rolExigido) {
  return (req, res, next) => {
    const cabecera = req.header('authorization') || '';
    // El esquema es "Bearer", un espacio y el token. Sin ese prefijo no hay token.
    const token = cabecera.startsWith('Bearer ') ? cabecera.slice(7) : '';
    try {
      const payload = jwt.verify(token, SECRETO);
      if (rolExigido && payload.rol !== rolExigido) {
        res.status(403).json({ error: 'rol insuficiente' });
        return;
      }
      req.usuario = payload;
      next();
    } catch {
      // Firma mala, token vacío o caducado.
      res.status(401).json({ error: 'token no valido' });
    }
  };
}
```

Sustituye el import y el GET. El PUT sigue sin `exigir`.

```js
// exigir cierra la ruta en la que lo pongas. montarSesion sigue siendo el login.
import { exigir, montarSesion } from './sesion.mjs';
```

```js
// Sin argumento solo mira la firma. Cualquier rol firmado con el secreto puede leer.
app.get('/recetas/r1', exigir(), (req, res) => {
  res.json({ id: 'r1', plato });
});
```

Guarda. `plato` vuelve a `sopa`.

```bash
curl -s -w '\n%{http_code}\n' http://127.0.0.1:3001/recetas/r1
TOKEN=$(curl -s -H 'Content-Type: application/json' -d '{"sub":"noa","clave":"lab"}' http://127.0.0.1:3001/sesion | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>process.stdout.write(JSON.parse(s).token))")
curl -s -w '\n%{http_code}\n' -H "Authorization: Bearer $TOKEN" http://127.0.0.1:3001/recetas/r1
TOKEN=$(curl -s -H 'Content-Type: application/json' -d '{"sub":"ian","clave":"lab"}' http://127.0.0.1:3001/sesion | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>process.stdout.write(JSON.parse(s).token))")
curl -s -w '\n%{http_code}\n' -H "Authorization: Bearer $TOKEN" http://127.0.0.1:3001/recetas/r1
curl -s -w '\n%{http_code}\n' -X PUT -H 'Content-Type: application/json' -d '{"plato":"pescado"}' http://127.0.0.1:3001/recetas/r1
```

**Por qué:** `exigir()` acepta cualquier firma hecha con `secreto-recetas`. `ian` y `noa` leen. El PUT de la última línea no lleva token y aun así entra: la escritura sigue abierta.

**Resultado esperado:** 401, 200 con el plato, otro 200 con el token de `ian`, y 200 en el PUT.

### 3 — El cambio, solo para el chef

**Acción:** sustituye el PUT por este.

```js
// El rol firmado tiene que ser chef. Un token válido de otro rol se queda en 403.
app.put('/recetas/r1', exigir('chef'), (req, res) => {
  plato = req.body.plato;
  res.json({ id: 'r1', plato });
});
```

Guarda. `plato` vuelve a `sopa`.

```bash
TOKEN=$(curl -s -H 'Content-Type: application/json' -d '{"sub":"noa","clave":"lab"}' http://127.0.0.1:3001/sesion | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>process.stdout.write(JSON.parse(s).token))")
curl -s -w '\n%{http_code}\n' -X PUT -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d '{"plato":"arroz"}' http://127.0.0.1:3001/recetas/r1
TOKEN=$(curl -s -H 'Content-Type: application/json' -d '{"sub":"ian","clave":"lab"}' http://127.0.0.1:3001/sesion | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>process.stdout.write(JSON.parse(s).token))")
curl -s -w '\n%{http_code}\n' -X PUT -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d '{"plato":"nada"}' http://127.0.0.1:3001/recetas/r1
curl -s -w '\n%{http_code}\n' -H "Authorization: Bearer $TOKEN" http://127.0.0.1:3001/recetas/r1
curl -s -w '\n%{http_code}\n' http://127.0.0.1:3001/recetas/r1
```

**Por qué:** `exigir('chef')` compara el rol firmado. `ian` puede leer el plato que dejó `noa`. Sin cabecera, el GET ya no sabe quién llama.

**Resultado esperado:** 200 `arroz`, 403, 200 con `plato` `arroz` y, sin cabecera, 401.

## Así se ve

`noa` deja el plato en `arroz` (200). `ian` recibe 403 al escribir y 200 al leer ese plato. Sin cabecera, 401.

![resultado del laboratorio](resultado.png)

## Comprueba tu entendimiento

**Un token firmado con otro secreto**
```bash
FALSO=$(node --input-type=module -e "import jwt from 'jsonwebtoken'; process.stdout.write(jwt.sign({sub:'noa',rol:'chef'},'otro',{expiresIn:'15m'}))")
curl -s -w '\n%{http_code}\n' -X PUT -H "Authorization: Bearer $FALSO" -H 'Content-Type: application/json' -d '{"plato":"nada"}' http://127.0.0.1:3001/recetas/r1
```
→ 401. El payload dice `chef` y la firma no es la de `secreto-recetas`.

## Reto

### 1 — Otra cuenta de chef

Añade la cuenta `eva` con rol `chef`. La clave sigue siendo `lab`. Entra como `eva` y deja el plato en `tarta`.

<details>
<summary>Ver solución</summary>

En `cuentas`:

```js
// eva entra con la misma clave. El rol lo pone esta tabla, igual que el de noa.
const cuentas = { noa: 'chef', ian: 'comensal', eva: 'chef' };
```

Guarda. `plato` vuelve a `sopa`.

```bash
TOKEN=$(curl -s -H 'Content-Type: application/json' -d '{"sub":"eva","clave":"lab"}' http://127.0.0.1:3001/sesion | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>process.stdout.write(JSON.parse(s).token))")
curl -s -w '\n%{http_code}\n' -X PUT -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d '{"plato":"tarta"}' http://127.0.0.1:3001/recetas/r1
```

200 y `plato` `tarta`. El rol lo sigue poniendo la tabla del servidor: `eva` firma como `chef` y el PUT la deja pasar.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| 401 con el token de `noa` | Falta el prefijo `Bearer ` | `Authorization: Bearer ` y el token |
| `ian` recibe 200 en el PUT | La ruta no usa `exigir('chef')` | El GET lleva `exigir()`. El PUT lleva `exigir('chef')` |
| El PUT del paso 2 ya responde 401 | Adelantaste `exigir('chef')` | Hasta el paso 3 el PUT va sin middleware |
