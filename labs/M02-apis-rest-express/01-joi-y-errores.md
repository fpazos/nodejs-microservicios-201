# Joi y códigos de error

[← Rutas](00-rutas-http.md) · [Siguiente página →](02-middleware.md)

El cliente puede mandar el JSON que quiera. Antes de guardarlo, la ruta necesita un esquema que diga qué forma tiene un contacto válido. Joi es ese control de esquema: describes el cuerpo (`email` como correo, `edad` como entero entre 0 y 120) y, al llegar el POST, Joi lo compara. Si no cuadra, la ruta no lo ve y la respuesta es 400 con el mensaje de Joi. El servicio queda como estaba. Con `convert: false`, la cadena `"30"` no se convierte en número, así que un texto donde pedías un entero también se rechaza.

Si el cuerpo entra, la ruta responde 201. Si la ruta lanza algo que no tenía previsto, Express 5 entrega esa excepción a un middleware de cuatro argumentos, `(err, req, res, next)`, y ese middleware responde 500. El proceso sigue escuchando. Sin él, la excepción se queda sin respuesta HTTP.

| Situación | Código | Quién lo decide |
|-----------|--------|-----------------|
| El cuerpo no pasa el esquema | 400 | Joi, antes de guardar |
| El alta entra | 201 | La ruta |
| La ruta lanza | 500 | El middleware de error |

El id que no existe, en la página anterior, era 404. Aquí el recurso existe como contrato: lo que falla es el cuerpo o el servidor.

## Ejemplo

La demostración está en [Joi y códigos de estado](../../ejemplos/02-joi-errores/README.md). Un contacto con `email` `no-es` y `edad` `-1` responde 400. `ana@ejemplo.es` con edad `30` responde 201. Joi no acepta el TLD `.test`. `GET /romper` lanza y responde 500 con `fallo inesperado`. El proceso sigue escuchando.

El laboratorio que junta validación, verbos y clave está al final de la página de middleware.
