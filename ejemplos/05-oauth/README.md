# OAuth 2.0, OpenID Connect y Passport

El portal no pide la contraseña del proveedor. Manda el navegador a `/authorize`, recibe un `code`, lo cambia por un token y con el token pide `/userinfo`. El `sub` es la pieza de identidad de OpenID Connect.

El proveedor de este ejemplo escucha en el puerto 4000. Google, Facebook y GitHub son el mismo intercambio con otras URL:

| Proveedor | Autorización | Token |
|-----------|--------------|-------|
| Este ejemplo | `http://127.0.0.1:4000/authorize` | `http://127.0.0.1:4000/token` |
| GitHub | `https://github.com/login/oauth/authorize` | `https://github.com/login/oauth/access_token` |
| Google | `https://accounts.google.com/o/oauth2/v2/auth` | `https://oauth2.googleapis.com/token` |
| Facebook | `https://www.facebook.com/v19.0/dialog/oauth` | `https://graph.facebook.com/v19.0/oauth/access_token` |

## Cómo ejecutarlo

```bash
cd ejemplos/05-oauth
npm install
npm run proveedor
```

En otra terminal: `npm run portal`. En una tercera:

```bash
curl -sS -c /tmp/ms-oauth -b /tmp/ms-oauth -L http://127.0.0.1:3002/auth
echo
```

## Qué se ve

`{"sub":"eva","email":"eva@ejemplo.test"}`. Sin la cookie del tarro, `GET /yo` responde 401.
