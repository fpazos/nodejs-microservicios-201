# M04 — Estado y persistencia

[← M03](../M03-comunicacion-entre-servicios/README.md) · [Siguiente módulo →](../M05-seguridad-y-autenticacion/README.md)

Cada dato tiene un sitio. La lectura caliente y la consulta no tienen por qué usar el mismo sitio que la escritura.

| Dato del ejemplo | Motor | Acceso |
|------------------|-------|--------|
| Libro | MongoDB | Mongoose |
| Butaca | PostgreSQL | Sequelize |
| Ficha, segunda lectura | Redis | ioredis, con Mongo detrás |
| Comanda | PostgreSQL al escribir, Redis al leer | Sequelize |

Redis aquí es caché o lado de lectura. No es de donde se recupera el dato si se vacía la memoria.

## Ejemplos

| Ejemplo | Qué hay |
|---------|---------|
| [Mongoose](../../ejemplos/04-mongoose/README.md) | El libro sigue cuando el proceso de alta ha terminado |
| [Sequelize](../../ejemplos/04-sequelize/README.md) | La butaca es una fila |
| [Redis](../../ejemplos/04-redis-cache/README.md) | `mongo` en el primer GET, `redis` en el segundo |
| [CQRS](../../ejemplos/04-cqrs/README.md) | 201, un 404 de un instante, y luego 200 |

## Laboratorios

| Laboratorio | De qué partes |
|-------------|----------------|
| [Caché](lab-cache/README.md) | Películas que siempre leen Mongo. Redis está conectado y no se usa |
| [CQRS](lab-cqrs/README.md) | El GET del turno lee la misma tabla que el POST |

→ Empieza por **[Mongoose](../../ejemplos/04-mongoose/README.md)**.
