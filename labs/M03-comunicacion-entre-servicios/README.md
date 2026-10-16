# M03 — Comunicación entre microservicios

[← Página anterior](../M02-apis-rest-express/03-lab-middleware.md) · [Siguiente página →](00-tres-formas-de-hablar.md)

Cuando Nexo acepta el pedido `PED-1001`, `notificaciones` tiene que enterarse y la pantalla del cliente tiene que ver el estado. Este módulo separa cuatro mecanismos: el evento dentro del proceso, la cola, la llamada gRPC y el WebSocket.

## Qué aprenderás

- Emitir un evento con `EventEmitter` y ver que no sale del proceso.
- Publicar y consumir el mismo hecho en RabbitMQ y en Kafka.
- Preguntar el stock a `catalogo` con gRPC y contrastarlo con un GET REST.
- Empujar el estado del pedido por un WebSocket.

## Teoría

| Necesidad en Nexo | Mecanismo | Qué se obtiene |
|-------------------|-----------|----------------|
| Avisar dentro del mismo proceso | `EventEmitter` | Una función local se entera al momento. Si el proceso muere, el aviso también |
| Avisar a otro servicio, aunque ahora mismo no esté | Cola: RabbitMQ o Kafka | El hecho queda guardado hasta que `notificaciones` lo lee |
| Preguntar el stock y seguir con la respuesta | gRPC (o REST) | Una llamada y una respuesta, en el mismo intercambio |
| Mantener abierta la pantalla del cliente | WebSocket | El servidor empuja `estado` sin un GET nuevo |

RabbitMQ y Kafka hacen de buzón. En el laboratorio el hecho es el mismo JSON: `{ "id": "PED-1001", "sku": "NX-1" }`. RabbitMQ entrega desde una cola con nombre. Kafka entrega desde un topic al que un grupo de consumidores se suscribe y del que guarda el offset.

gRPC define el contrato en un `.proto` y viaja en HTTP/2 con un cuerpo binario. REST define el contrato en el camino, el verbo y el JSON. Para «dame el producto NX-1» los dos valen; gRPC compensa cuando hay muchas llamadas internas y el contrato está en un fichero compartido.

> [!NOTE]
> `EventEmitter` no es un broker. El lab de la cola existe precisamente para cruzar esa frontera.

## Páginas

| # | Página | Qué hay |
|---|--------|---------|
| 00 | [Tres formas de hablar](00-tres-formas-de-hablar.md) | El pedido y los cuatro canales, en relato |
| 01 | [EventEmitter](01-lab-event-emitter.md) | `pedido:creado` dentro de un solo proceso |
| 02 | [RabbitMQ](02-lab-rabbitmq.md) | Publicar y consumir `pedidos.creados` |
| 03 | [Kafka](03-lab-kafka.md) | El mismo hecho en el topic `pedidos.creados` |
| 04 | [gRPC](04-lab-grpc.md) | `GetProducto` y el GET equivalente |
| 05 | [WebSockets](05-lab-websockets.md) | El estado `en-reparto` llega al cliente |

→ Empieza por **[00 — Tres formas de hablar](00-tres-formas-de-hablar.md)**.
