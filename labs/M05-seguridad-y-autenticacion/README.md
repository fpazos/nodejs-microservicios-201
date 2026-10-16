# M05 — Seguridad y autenticación

[← M04](../M04-estado-y-persistencia/README.md) · [Siguiente módulo →](../M06-docker-y-kubernetes/README.md)

Autenticar es saber quién llama. Autorizar es decidir si ese rol entra. Cifrar es que la contraseña no se pueda leer, que un campo sí se pueda recuperar y que el canal no vaya en claro.

## Ejemplos

| Ejemplo | Qué hay |
|---------|---------|
| [JWT](../../ejemplos/05-jwt/README.md) | `eva` edita, `leo` recibe 403, sin token es 401 |
| [OAuth](../../ejemplos/05-oauth/README.md) | Authorization code contra un proveedor local, y las URL de GitHub, Google y Facebook |
| [Cifrado](../../ejemplos/05-cifrado/README.md) | bcrypt, AES-256-GCM y un HTTPS con certificado de ejemplo |

## Laboratorio

[Recetas](lab-jwt/README.md). El plato se cambia sin identidad. Dejas el token y el rol `chef`.

OAuth y el cifrado se ejecutan en sus ejemplos. No tienen laboratorio propio.

→ Empieza por **[JWT](../../ejemplos/05-jwt/README.md)**.
