# M02 — APIs REST con Express

[← M01](../M01-node-en-microservicios/README.md) · [Siguiente módulo →](../M03-comunicacion-entre-servicios/README.md)

Express une un verbo y un camino con una función. Joi decide si el cuerpo vale. El código HTTP dice qué ha pasado. El middleware ve la petición antes que la ruta.

Los tres ejemplos están separados. El laboratorio los junta en un recurso que no es ninguno de los tres.

## Qué aprenderás

- GET, POST, PUT y DELETE, con 201, 204 y 404.
- Rechazar un cuerpo con Joi y devolver 400, y un fallo inesperado con 500.
- Encadenar log, compresión y una clave.

## Ejemplos

| Ejemplo | Qué hay |
|---------|---------|
| [Rutas](../../ejemplos/02-rutas-http/README.md) | Notas en memoria, sin validar |
| [Joi](../../ejemplos/02-joi-errores/README.md) | Contactos: 400, 201 y 500 |
| [Middleware](../../ejemplos/02-middleware/README.md) | Informes con morgan, gzip y API key |

## Laboratorio

[Incidencias](lab-incidencias/README.md). Partes de un servidor que solo responde `/salud` y dejas el alta, la lectura, el cambio, el borrado, la validación y la clave.

→ Empieza por **[Rutas](../../ejemplos/02-rutas-http/README.md)**.
