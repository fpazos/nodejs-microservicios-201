# M03 — Comunicación entre servicios

[← M02](../M02-apis-rest-express/README.md) · [Siguiente página →](00-event-emitter.md)

Un servicio tiene que avisar a otro, preguntarle algo ahora, empujar un dato a quien sigue conectado, encontrar dónde está y ofrecer un solo puerto de entrada.

| Necesidad | Mecanismo | Página |
|-----------|-----------|--------|
| Avisar dentro del mismo proceso | `EventEmitter` | 00, con laboratorio |
| Dejar un aviso aunque el otro proceso esté parado | Cola | 01 RabbitMQ, con laboratorio. 02 Kafka, solo ejemplo |
| Preguntar y esperar, con el contrato en un fichero | gRPC | 03 |
| Mantener un canal abierto | WebSocket | 04 |
| No escribir la dirección a mano | Consul | 05, con laboratorio |
| Un puerto para el cliente | Gateway en Express | 06, con laboratorio |

> [!NOTE]
> El laboratorio de cola es RabbitMQ. Kafka se ejecuta para ver el topic y el offset del grupo.

## Páginas

| # | Página | Después de explicarla |
|---|--------|------------------------|
| 00 | [EventEmitter](00-event-emitter.md) | [Ejemplo](../../ejemplos/03-event-emitter/README.md) · [laboratorio](lab-eventos/README.md) |
| 01 | [RabbitMQ](01-rabbitmq.md) | [Ejemplo](../../ejemplos/03-rabbitmq/README.md) · [laboratorio](lab-rabbitmq/README.md) |
| 02 | [Kafka](02-kafka.md) | [Ejemplo](../../ejemplos/03-kafka/README.md) |
| 03 | [gRPC](03-grpc.md) | [Ejemplo](../../ejemplos/03-grpc/README.md) |
| 04 | [WebSockets](04-websockets.md) | [Ejemplo](../../ejemplos/03-websockets/README.md) |
| 05 | [Consul](05-consul.md) | [Ejemplo](../../ejemplos/03-consul/README.md) · [laboratorio](lab-consul/README.md) |
| 06 | [Gateway](06-gateway.md) | [Ejemplo](../../ejemplos/03-gateway/README.md) · [laboratorio](lab-gateway/README.md) |

→ Empieza por **[EventEmitter](00-event-emitter.md)**.
