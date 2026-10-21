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
| Reenviar sin sumar la espera del gateway | Proxy inverso | 07, con laboratorio |
| El mismo puerto, con dos copias y un check | HAProxy | 08, con laboratorio |

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
| 07 | [Proxy inverso](07-proxy-inverso.md) | [Ejemplo](../../ejemplos/03-proxy-inverso/README.md) · [laboratorio](lab-proxy/README.md) |
| 08 | [Gateway con HAProxy](08-gateway-haproxy.md) | [Ejemplo](../../ejemplos/03-haproxy/README.md) · [laboratorio](lab-haproxy/README.md) |

> [!NOTE]
> El 06 es un gateway escrito en Express. El 07 lo cambia por un proxy inverso que encadena la respuesta en vez de almacenarla. El 08 es HAProxy: el mismo puerto, con dos copias de un servicio y un check que aparta a la que no responde.

→ Empieza por **[EventEmitter](00-event-emitter.md)**.
