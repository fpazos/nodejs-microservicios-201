# Rutas y verbos HTTP

[← CPU](../M01-node-en-microservicios/01-cpu-y-otros-runtimes.md) · [Siguiente página →](01-joi-y-errores.md)

Express une tres cosas: un verbo, un camino y una función. Esa función es el controlador del recurso. Recibe la petición y escribe la respuesta. En Express 5, si la función es `async` y lanza, el error llega al middleware de errores. En este ejemplo todavía no hay ese middleware: el cuerpo se guarda tal cual.

El recurso de la demostración es una nota en memoria. El `id` va en el camino. El texto va en el JSON.

| Verbo | Camino | Qué hace | Código cuando sale bien |
|-------|--------|----------|--------------------------|
| GET | `/notas` | Lista. Vacío es `[]`, no un error | 200 |
| GET | `/notas/:id` | Una nota | 200, o 404 si el id no está |
| POST | `/notas` | Crea | 201 y el recurso |
| PUT | `/notas/:id` | Sustituye el texto | 200, o 404 |
| DELETE | `/notas/:id` | Borra | 204, sin cuerpo |

204 y 404 se leen en las cabeceras. El cuerpo vacío de un 204 es el resultado, no un fallo del `curl`.

La memoria muere con el proceso. Aquí sirve para ver el contrato HTTP sin una base. La persistencia es otro módulo.

## Ejemplo

La demostración está en [Rutas HTTP](../../ejemplos/02-rutas-http/README.md). Alta `n1` con texto `comprar cafe`, lectura, cambio a `comprar te`, borrado y un GET que ya no encuentra la nota: 201, el texto nuevo, 204 y 404.

Esta página no valida el cuerpo ni pide clave. Eso se explica en las dos siguientes. El laboratorio del módulo junta las tres sobre otro recurso, y se hace al cerrar el middleware.
