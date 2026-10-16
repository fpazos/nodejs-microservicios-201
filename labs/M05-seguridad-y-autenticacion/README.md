# M05 — Seguridad y autenticación

[← Página anterior](../M04-estado-y-persistencia/04-lab-cqrs.md) · [Siguiente página →](00-identidad-en-nexo.md)

Ana opera el almacén y Luis es el cliente del envío. Este módulo distingue quién llama, qué puede hacer y cómo dejan de viajar en claro la contraseña, la dirección y el canal.

## Qué aprenderás

- Generar y validar un JWT con `jsonwebtoken`.
- Autorizar por rol: `operador` cambia el stock, `cliente` no.
- Recorrer un authorization code con Passport y reconocer el mismo flujo en Google, Facebook y GitHub, más la pieza de identidad de OpenID Connect.
- Guardar una contraseña con bcrypt, cifrar la dirección con `node:crypto` y servir el API por TLS.

## Teoría

Autenticar es saber quién llama. Autorizar es decidir si ese rol entra en la ruta.

El JWT de laboratorio lo firma `pedidos` con el secreto `nexo-lab-secreto`. El payload lleva `sub` (`ana` o `luis`) y `rol`. Cada petición lo manda en `Authorization: Bearer …`. El middleware verifica la firma y mira el rol. Quien no trae token recibe 401. Quien trae un rol que no puede recibe 403.

OAuth 2.0, en el grant authorization code, evita que Nexo pida la contraseña del proveedor:

1. El navegador va a la URL de autorización.
2. El proveedor devuelve un `code` al `callback`.
3. El servidor de Nexo cambia el `code` por un `access_token`.
4. Con ese token pide la identidad.

OpenID Connect añade a ese baile un `sub` estable (y, en el flujo completo, un id token). Google, Facebook y GitHub exponen el mismo esquema con otras URL:

| Proveedor | Autorización | Token |
|-----------|--------------|-------|
| GitHub | `https://github.com/login/oauth/authorize` | `https://github.com/login/oauth/access_token` |
| Google | `https://accounts.google.com/o/oauth2/v2/auth` | `https://oauth2.googleapis.com/token` |
| Facebook | `https://www.facebook.com/v19.0/dialog/oauth` | `https://graph.facebook.com/v19.0/oauth/access_token` |

En el laboratorio el proveedor escucha en `127.0.0.1:4000`, con el mismo intercambio, para no registrar una aplicación en esas consolas.

| Dato | Herramienta | Qué se puede hacer después |
|------|-------------|----------------------------|
| Contraseña | bcrypt | Comprobarla. No se descifra |
| Dirección postal | AES-256-GCM (`node:crypto`) | Descifrarla con la misma clave |
| Cable HTTP | TLS | Impedir que el JSON viaje en claro por la red |

> [!WARNING]
> El secreto `nexo-lab-secreto` y el certificado que genera openssl son del laboratorio. No los reutilices en otro sitio.

## Páginas

| # | Página | Qué hay |
|---|--------|---------|
| 00 | [Identidad en Nexo](00-identidad-en-nexo.md) | El carné de Ana, partido en cabecera, payload y firma |
| 01 | [JWT y roles](01-lab-jwt-y-roles.md) | Ana actualiza el stock y Luis recibe 403 |
| 02 | [OAuth y Passport](02-lab-oauth-passport.md) | Authorization code contra el proveedor local |
| 03 | [Cifrado y TLS](03-lab-cifrado-y-tls.md) | bcrypt, un campo cifrado y HTTPS |

→ Empieza por **[00 — Identidad en Nexo](00-identidad-en-nexo.md)**.
