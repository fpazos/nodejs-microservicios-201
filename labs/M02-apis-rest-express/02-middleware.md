# Middleware

[← Joi](01-joi-y-errores.md) · [Siguiente página →](../M03-comunicacion-entre-servicios/00-event-emitter.md)

Un middleware es una función que ve la petición antes que la ruta, o entre medias. El orden de `app.use` es el orden en que pasan. Cada uno llama a `next()` para soltar la petición, o responde y corta la cadena. El temario nombra tres papeles, y en el ejemplo cada uno se engancha en un sitio distinto.

| Middleware | Dónde se engancha | Qué hace |
|------------|-------------------|----------|
| `morgan` | Todas las peticiones | Escribe una línea de log |
| `compression` | Todas | Si el cliente acepta gzip, comprime el cuerpo |
| La clave | Solo `/informes` | Sin `x-api-key` responde 401 y no llega a la ruta |

`/salud` no pide clave. Una comprobación de vida que exige credencial deja de servir para saber si el proceso está arriba. La clave de este ejemplo, `clave-informes`, es un middleware de autenticación mínimo: aún no hay usuario ni rol. El rol llega con JWT.

La compresión se ve en la cabecera `Content-Encoding: gzip`, no en el JSON que `curl` imprime si no se guarda el cuerpo.

## Ejemplo

La demostración está en [Middleware](../../ejemplos/02-middleware/README.md). `/salud` responde 200 sin clave. `/informes` sin clave responde 401. Con `x-api-key: clave-informes` y `Accept-Encoding: gzip`, el fichero descargado es gzip y la terminal del servidor tiene una línea de morgan por petición.

## Laboratorio

Las tres páginas de este módulo se practican juntas en [Incidencias](lab-incidencias/README.md). El servidor de partida solo responde `/salud`. El recurso es una incidencia (`id`, `titulo`, `gravedad`), no una nota ni un contacto ni un informe. Ahí se dejan el alta, la lectura, el cambio, el borrado, el esquema Joi y la clave `x-api-key: lab-incidencias` solo en las escrituras.
