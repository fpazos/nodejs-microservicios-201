# Rutas y verbos HTTP

[← CPU](../M01-node-en-microservicios/01-cpu-y-otros-runtimes.md) · [Siguiente página →](01-joi-y-errores.md)

Express recibe la petición y tiene que decidir qué función la atiende. Esa función, el controlador, se elige con el verbo y el camino: juntos dicen si se lista, se lee, se crea, se cambia o se borra. En este ejemplo el recurso es una nota en memoria, el `id` va en el camino y el texto en el JSON. Todavía no hay middleware de errores, así que la ruta guarda el cuerpo tal cual cuando termina bien.

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
