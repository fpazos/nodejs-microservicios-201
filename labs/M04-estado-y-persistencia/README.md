# M04 — Estado y persistencia

[← Página anterior](../M03-comunicacion-entre-servicios/05-lab-websockets.md) · [Siguiente página →](00-donde-vive-el-dato.md)

El array del catálogo desaparece al cerrar el proceso. Este módulo deja cada dato de Nexo en el sitio que le corresponde y separa la escritura del pedido de la lectura que hace la pantalla.

## Qué aprenderás

- Conectar Node a MongoDB, PostgreSQL y Redis.
- Modelar el catálogo con Mongoose y el pedido con Sequelize.
- Servir el stock desde Redis para no leer MongoDB en cada GET.
- Aplicar CQRS: el comando escribe en PostgreSQL y la consulta lee Redis, aceptando un instante de consistencia eventual.

## Teoría

| Dato de Nexo | Motor | Por qué ese | Acceso desde Node |
|--------------|-------|-------------|-------------------|
| SKU, nombre, stock | MongoDB | El documento del producto crece sin una tabla fija | Mongoose |
| Pedido, estado, dirección | PostgreSQL | El pedido es una fila con integridad | Sequelize |
| Copia caliente del stock o del pedido | Redis | Lectura en memoria, con caducidad | ioredis |

Cada servicio es dueño de su base. `pedidos` no abre MongoDB «para mirar el nombre»: pregunta a `catalogo` o escucha un hecho. Esa frontera es la que hace posible partir el monolito.

La consistencia eventual aparece cuando la escritura y la lectura no son el mismo sitio. El POST confirma el pedido en PostgreSQL. Un proyectador copia el resultado a Redis. Quien lea Redis un instante antes de esa copia no ve el pedido. No es un fallo: es el intervalo que hay que conocer.

CQRS pone nombre a esa separación: el comando (`POST /pedidos`) y la consulta (`GET /pedidos/:id` contra la proyección) no pasan por el mismo modelo.

> [!NOTE]
> Redis en este curso es caché o lado de lectura. No es el almacén del que Nexo recupera los pedidos si se vacía la memoria.

## Páginas

| # | Página | Qué hay |
|---|--------|---------|
| 00 | [Dónde vive el dato](00-donde-vive-el-dato.md) | El mapa de SKU, pedido y copia caliente |
| 01 | [MongoDB y Mongoose](01-lab-mongodb-mongoose.md) | El producto `NX-1` sobrevive a reiniciar el proceso |
| 02 | [PostgreSQL y Sequelize](02-lab-postgres-sequelize.md) | El pedido `PED-1001` en una tabla |
| 03 | [Redis como caché](03-lab-redis-cache.md) | El segundo GET del stock no toca MongoDB |
| 04 | [CQRS](04-lab-cqrs.md) | Escribes en Postgres, lees en Redis, y ves el hueco |

→ Empieza por **[00 — Dónde vive el dato](00-donde-vive-el-dato.md)**.
