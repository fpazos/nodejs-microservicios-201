# M03 — Comunicación entre servicios

[← M02](../M02-apis-rest-express/README.md) · [Siguiente módulo →](../M04-estado-y-persistencia/README.md)

Un servicio tiene que avisar a otro, preguntarle algo ahora, empujar un dato a quien sigue conectado, encontrar dónde está y ofrecer un solo puerto de entrada.

| Necesidad | Mecanismo | Dónde |
|-----------|-----------|--------|
| Avisar dentro del mismo proceso | `EventEmitter` | Ejemplo y laboratorio |
| Dejar un aviso aunque el otro proceso esté parado | Cola | RabbitMQ (ejemplo y laboratorio) y Kafka (ejemplo) |
| Preguntar y esperar la respuesta, con el contrato en un fichero | gRPC | Ejemplo, al lado de un GET |
| Mantener un canal abierto | WebSocket | Ejemplo |
| No escribir la dirección a mano | Consul | Ejemplo y laboratorio |
| Un puerto para el cliente | Gateway en Express | Ejemplo y laboratorio |

> [!NOTE]
> El laboratorio de cola es RabbitMQ. Kafka se ejecuta para ver el topic y el offset del grupo. No hay un segundo laboratorio de broker.

## Ejemplos

| Ejemplo | Qué hay |
|---------|---------|
| [EventEmitter](../../ejemplos/03-event-emitter/README.md) | `alarma` en un proceso y silencio en el otro |
| [RabbitMQ](../../ejemplos/03-rabbitmq/README.md) | Cola `avisos` |
| [Kafka](../../ejemplos/03-kafka/README.md) | Topic `avisos`, grupo `lectores` |
| [gRPC](../../ejemplos/03-grpc/README.md) | `GetPieza` y el GET |
| [WebSockets](../../ejemplos/03-websockets/README.md) | Una sala |
| [Consul](../../ejemplos/03-consul/README.md) | `reloj` se registra y el cliente lo busca |
| [Gateway](../../ejemplos/03-gateway/README.md) | Clima y cotizaciones detrás del 8080. Tres Dockerfile, uno por carpeta |

## Laboratorios

| Laboratorio | De qué partes |
|-------------|----------------|
| [Eventos](lab-eventos/README.md) | Un `emit` sin oyente |
| [RabbitMQ](lab-rabbitmq/README.md) | El broker ya está. Tú nombras la cola `trabajos` |
| [Consul](lab-consul/README.md) | `prefijos` responde y no está en el listín |
| [Gateway](lab-gateway/README.md) | Agenda y tiempo ya corren. El 8080 solo tiene `/salud` |

→ Empieza por **[EventEmitter](../../ejemplos/03-event-emitter/README.md)**.
