# M02 — APIs REST con Express

[← M01](../M01-node-en-microservicios/README.md) · [Siguiente página →](00-rutas-http.md)

Express ata un verbo y un camino a una función, que es quien responde. Antes de que esa función guarde el cuerpo, Joi lo compara con un esquema y decide si vale. El código HTTP cuenta qué ha pasado, y el middleware ve la petición antes que la ruta. Cada página se explica y se demuestra. El laboratorio llega al cerrar las tres y junta rutas, validación y clave sobre un recurso que no es ninguno de los ejemplos.

## Qué aprenderás

- GET, POST, PUT y DELETE, con 201, 204 y 404.
- Rechazar un cuerpo con Joi y devolver 400, y un fallo inesperado con 500.
- Encadenar log, compresión y una clave.

## Páginas

| # | Página | Después de explicarla |
|---|--------|------------------------|
| 00 | [Rutas](00-rutas-http.md) | [Ejemplo: notas](../../ejemplos/02-rutas-http/README.md) |
| 01 | [Joi y errores](01-joi-y-errores.md) | [Ejemplo: contactos](../../ejemplos/02-joi-errores/README.md) |
| 02 | [Middleware](02-middleware.md) | [Ejemplo: informes](../../ejemplos/02-middleware/README.md), y el [laboratorio de incidencias](lab-incidencias/README.md) |

→ Empieza por **[Rutas](00-rutas-http.md)**.
