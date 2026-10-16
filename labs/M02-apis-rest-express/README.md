# M02 — APIs REST con Express

[← Página anterior](../M01-node-en-microservicios/02-lab-cuando-node.md) · [Siguiente página →](00-rutas-express.md)

El catálogo de Nexo tiene que dejar de ser un array dentro de un script. Este módulo lo publica con Express: rutas, verbos HTTP, validación, errores con código y el middleware que registra, comprime y exige una clave.

## Qué aprenderás

- Crear rutas y controladores para el SKU `NX-1`.
- Responder a GET, POST, PUT y DELETE, también cuando el controlador es asíncrono.
- Validar el cuerpo con Joi y devolver 400, 404 o 201 según lo que haya pasado.
- Encadenar middleware de logging, compresión y una API key de laboratorio.

## Teoría

Express es una capa fina sobre el servidor HTTP de Node. Una ruta une un método y un camino con una función. Esa función es el controlador: lee `req` y escribe `res`.

| Método | Uso en el catálogo | Éxito habitual |
|--------|--------------------|----------------|
| GET | Leer uno o la lista | 200 |
| POST | Crear un SKU | 201 |
| PUT | Sustituir nombre o stock | 200 |
| DELETE | Quitar un SKU | 204 |

El middleware es una función `(req, res, next)` que corre antes de la ruta, o un manejador de cuatro argumentos `(err, req, res, next)` que corre cuando alguien llama a `next(err)` o una promesa se rechaza. Express 5 entrega ese rechazo al manejador de errores sin un `try/catch` en cada ruta.

Joi comprueba el JSON antes de tocar el array. Si no encaja, la petición acaba en 400 y el SKU no se crea.

> [!NOTE]
> La API key de este módulo es el portero de laboratorio. La identidad de Ana y de Luis, con JWT y con OAuth, está en M05. Esta página no depende de aquella.

## Páginas

| # | Página | Qué hay |
|---|--------|---------|
| 00 | [Rutas Express](00-rutas-express.md) | Recorrido por el contrato del catálogo |
| 01 | [CRUD del catálogo](01-lab-crud-catalogo.md) | Los cuatro verbos y un handler que espera sin bloquear `/salud` |
| 02 | [Joi y errores](02-lab-joi-y-errores.md) | Cuerpo inválido, 400, y un 404 cuando el SKU no está |
| 03 | [Middleware](03-lab-middleware.md) | morgan, compression y cabecera `x-api-key` |

→ Empieza por **[00 — Rutas Express](00-rutas-express.md)**.
