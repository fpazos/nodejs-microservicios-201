# Joi y códigos de error

[← Rutas](00-rutas-http.md) · [Siguiente página →](02-middleware.md)

Un cuerpo que no cumple el contrato no se guarda. Joi describe el cuerpo antes de la ruta: `email` tiene que ser un correo, `edad` un entero entre 0 y 120. Con `convert: false`, la cadena `"30"` no se convierte en número: si el cliente mandó un texto, el esquema lo rechaza.

El fallo de validación es un 400. El mensaje es el de Joi. Un 400 dice que la petición está mal formada. El servicio sigue igual que antes de recibirla.

Un fallo que la ruta no esperaba es un 500. Express 5 entrega la excepción de una ruta `async` al middleware de cuatro argumentos `(err, req, res, next)`. Ese middleware escribe el 500 y el proceso sigue en marcha. Sin él, la excepción se queda sin respuesta HTTP.

| Situación | Código | Quién lo decide |
|-----------|--------|-----------------|
| El cuerpo no pasa el esquema | 400 | Joi, antes de guardar |
| El alta entra | 201 | La ruta |
| La ruta lanza | 500 | El middleware de error |

El id que no existe, en la página anterior, era 404. Aquí el recurso existe como contrato: lo que falla es el cuerpo o el servidor.

## Ejemplo

La demostración está en [Joi y códigos de estado](../../ejemplos/02-joi-errores/README.md). Un contacto con `email` `no-es` y `edad` `-1` responde 400. `ana@ejemplo.es` con edad `30` responde 201. Joi no acepta el TLD `.test`. `GET /romper` lanza y responde 500 con `fallo inesperado`. El proceso sigue escuchando.

El laboratorio que junta validación, verbos y clave está al final de la página de middleware.
