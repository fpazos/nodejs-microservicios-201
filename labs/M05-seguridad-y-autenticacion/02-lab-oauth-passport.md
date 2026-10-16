# OAuth y Passport

[← Página anterior](01-lab-jwt-y-roles.md) · [Siguiente página →](03-lab-cifrado-y-tls.md)

Vas a entrar en `pedidos` sin contarle a Nexo la contraseña de Ana: el proveedor local entrega un código, Passport lo cambia por un token y `/userinfo` dice quién es.

### Objetivo

Terminar en `{"sub":"ana","email":"ana@nexo.test"}` después de seguir las redirecciones de `/auth`.

### Punto de partida

```bash
mkdir -p ~/nexo/m05-oauth && cd ~/nexo/m05-oauth
npm init -y
npm pkg set type=module
npm install express@5 passport passport-oauth2 express-session
```

- Puertos 4000 y 3002 libres.
- El proveedor imita el authorization code. No llama a Google, Facebook ni GitHub: el paso 5 deja sus URL al lado de las de este laboratorio.

### En qué consiste

Arrancas el proveedor, arrancas `pedidos` con Passport y recorres `/auth` guardando la cookie de sesión.

### 1 — Escribe el proveedor

**Acción:** guarda `proveedor.mjs`.

```js
import express from 'express';

const app = express();
app.use(express.urlencoded({ extended: false }));

app.get('/authorize', (req, res) => {
  const destino = new URL(req.query.redirect_uri);
  destino.searchParams.set('code', 'codigo-lab');
  destino.searchParams.set('state', req.query.state);
  res.redirect(destino.toString());
});

app.post('/token', (req, res) => {
  if (req.body.code !== 'codigo-lab' || req.body.client_secret !== 'secreto-lab') {
    res.status(400).json({ error: 'invalid_grant' });
    return;
  }
  res.json({ access_token: 'token-ana', token_type: 'Bearer' });
});

app.get('/userinfo', (req, res) => {
  if (req.header('authorization') !== 'Bearer token-ana') {
    res.status(401).end();
    return;
  }
  res.json({ sub: 'ana', email: 'ana@nexo.test' });
});

app.listen(4000, () => console.log('proveedor en 4000'));
```

**Por qué:** `/authorize` es la ventanilla. En un proveedor real ahí se pediría la contraseña; aquí el laboratorio ya considera a Ana autenticada y devuelve `codigo-lab`. `/token` cambia el código por `token-ana`. `/userinfo` es la pieza de identidad: el `sub` estable que OpenID Connect añade al access token de OAuth.

**Resultado esperado:** `proveedor.mjs` creado.

### 2 — Escribe pedidos con Passport

**Acción:** guarda `pedidos.mjs`.

```js
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as OAuth2Strategy } from 'passport-oauth2';

passport.use(new OAuth2Strategy({
  authorizationURL: 'http://127.0.0.1:4000/authorize',
  tokenURL: 'http://127.0.0.1:4000/token',
  clientID: 'nexo-pedidos',
  clientSecret: 'secreto-lab',
  callbackURL: 'http://127.0.0.1:3002/auth/callback',
  state: true,
}, (accessToken, refreshToken, profile, done) => {
  done(null, { accessToken });
}));

passport.serializeUser((usuario, done) => done(null, usuario));
passport.deserializeUser((usuario, done) => done(null, usuario));

const app = express();
app.use(session({ secret: 'nexo-sesion', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.get('/auth', passport.authenticate('oauth2'));
app.get('/auth/callback',
  passport.authenticate('oauth2', { session: true, failureRedirect: '/fallo' }),
  (req, res) => { res.redirect('/yo'); },
);
app.get('/fallo', (req, res) => {
  res.status(401).json({ error: 'oauth' });
});
app.get('/yo', async (req, res) => {
  if (!req.user) {
    res.status(401).json({ error: 'sin sesion' });
    return;
  }
  const respuesta = await fetch('http://127.0.0.1:4000/userinfo', {
    headers: { authorization: `Bearer ${req.user.accessToken}` },
  });
  res.json(await respuesta.json());
});

app.listen(3002, () => console.log('pedidos en 3002'));
```

**Por qué:** Passport guarda el `state` en la sesión y lo compara al volver. Nexo no ve la contraseña del proveedor: ve el código, en el callback, y lo cambia por el token. Con el token pide el `sub`.

**Resultado esperado:** `pedidos.mjs` creado.

### 3 — Arranca los dos procesos

**Acción:** en una terminal,

```bash
node proveedor.mjs
```

En otra,

```bash
node pedidos.mjs
```

**Por qué:** el callback de `pedidos` tiene que encontrar al proveedor en el puerto 4000 en el mismo intercambio.

**Resultado esperado:** `proveedor en 4000` y `pedidos en 3002`.

### 4 — Recorre el flujo

**Acción:** en una tercera terminal,

```bash
curl -sS -c /tmp/nexo-oauth -b /tmp/nexo-oauth -L \
  http://127.0.0.1:3002/auth
echo
```

**Por qué:** `-L` sigue las redirecciones (ventanilla, callback, `/yo`) y el tarro de cookies conserva la sesión donde Passport guardó el `state`. Sin esa cookie, el callback no cuadra.

**Resultado esperado:** `{"sub":"ana","email":"ana@nexo.test"}`.

### 5 — Pon al lado las URL de los proveedores del temario

**Acción:** abre `pedidos.mjs` y localiza `authorizationURL` y `tokenURL`. Compáralas con esta tabla. No hace falta llamarlas.

| Proveedor | authorizationURL | tokenURL |
|-----------|------------------|----------|
| Laboratorio | `http://127.0.0.1:4000/authorize` | `http://127.0.0.1:4000/token` |
| GitHub | `https://github.com/login/oauth/authorize` | `https://github.com/login/oauth/access_token` |
| Google | `https://accounts.google.com/o/oauth2/v2/auth` | `https://oauth2.googleapis.com/token` |
| Facebook | `https://www.facebook.com/v19.0/dialog/oauth` | `https://graph.facebook.com/v19.0/oauth/access_token` |

**Por qué:** cambiar de proveedor, en Passport, es cambiar esas dos URL, el `clientID` y el `clientSecret` registrados en su consola. El callback y el `state` se quedan.

**Resultado esperado:** en el fichero, las URL son las del laboratorio, puerto 4000.

## Comprueba tu entendimiento

**Sin cookie no hay sesión**
```bash
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3002/yo
```
→ 401. `/yo` solo conoce a Ana si la sesión del paso 4 va en la cookie.

## Reto

### 1 — Un código que el proveedor no emitió

Haz que el POST `/token` reciba `code=otro` y mira el estado.

<details>
<summary>Ver solución</summary>

```bash
curl -s -w '\n%{http_code}\n' -X POST -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'code=otro&client_secret=secreto-lab' \
  http://127.0.0.1:4000/token
```

Responde 400 y `invalid_grant`. El código es de un solo intercambio. En el flujo de Passport el código válido es `codigo-lab`, el que puso `/authorize`.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| `{"error":"oauth"}` o `sin sesion` tras el `curl -L` | La cookie no viajó | Usa a la vez `-c /tmp/nexo-oauth` y `-b /tmp/nexo-oauth` |
| `ECONNREFUSED` al puerto 4000 | El proveedor no está arrancado | `node proveedor.mjs` antes del `curl` |
| `TokenError` en la terminal de pedidos | El secreto del strategy no es `secreto-lab` | Tiene que coincidir con el `if` del proveedor |
