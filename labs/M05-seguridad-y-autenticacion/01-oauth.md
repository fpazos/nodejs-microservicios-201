# OAuth 2.0, OpenID Connect y Passport

[← JWT](00-jwt.md) · [Siguiente página →](02-cifrado-y-tls.md)

El portal no pide la contraseña del otro sitio. Manda el navegador a la autorización. El proveedor, si acepta, redirige de vuelta con un `code`. El portal cambia ese `code` por un token, con su `client_id` y su secreto, y con el token pide los datos de la persona.

Ese intercambio es el authorization code. OpenID Connect pone encima una identidad: `userinfo` devuelve un `sub` estable y, en este ejemplo, un email. El `sub` es quién es. El token de acceso es el permiso para preguntarlo.

Passport encadena eso en Express: la ruta `/auth` empieza el flujo, `/auth/callback` recibe el `code`, y la sesión del portal guarda que ya pasó. `state` evita que un callback ajeno se cuele. Sin la cookie de esa sesión, `/yo` responde 401.

El proveedor del ejemplo es local, en el puerto 4000. El código fijo es `codigo-lab`, el secreto del cliente es `secreto-lab` y el token es `token-eva`. La persona es `eva`, `eva@ejemplo.test`. No hace falta una cuenta de GitHub, Google ni Facebook. Esas tres son el mismo intercambio con otras URL:

| Proveedor | Autorización | Token |
|-----------|--------------|-------|
| Este ejemplo | `http://127.0.0.1:4000/authorize` | `http://127.0.0.1:4000/token` |
| GitHub | `https://github.com/login/oauth/authorize` | `https://github.com/login/oauth/access_token` |
| Google | `https://accounts.google.com/o/oauth2/v2/auth` | `https://oauth2.googleapis.com/token` |
| Facebook | `https://www.facebook.com/v19.0/dialog/oauth` | `https://graph.facebook.com/v19.0/oauth/access_token` |

## Ejemplo

La demostración está en [OAuth y Passport](../../ejemplos/05-oauth/README.md). El `curl` que sigue las redirecciones y guarda la cookie imprime `{"sub":"eva","email":"eva@ejemplo.test"}`.

No hay laboratorio. El flujo se recorre contra el proveedor local.
