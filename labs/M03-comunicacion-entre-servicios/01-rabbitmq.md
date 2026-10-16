# RabbitMQ

[← EventEmitter](00-event-emitter.md) · [Siguiente página →](02-kafka.md)

La cola vive en otro proceso, el broker. El publicador entrega el mensaje y puede terminar. El consumidor lo lee cuando está. Si el consumidor está parado, el mensaje espera en la cola: `Ready` pasa a 1. Cuando el consumidor arranca, confirma con `ack` y `Ready` vuelve a 0.

Eso es lo que `EventEmitter` no puede hacer. El aviso sobrevive al proceso que lo tenía que leer.

El ejemplo usa la cola `avisos`, el usuario `guest` y la clave `guest`. La consola de gestión escucha en el puerto 15672. El cuerpo es el mismo aviso de zona: `{"zona":"hall"}`.

RabbitMQ guarda el mensaje hasta que un consumidor lo confirma. Kafka, en la página siguiente, lo conserva en el topic y cada grupo recuerda hasta dónde leyó. El laboratorio de cola es este. Kafka se arranca para ver el otro mecanismo.

## Ejemplo

La demostración está en [RabbitMQ](../../ejemplos/03-rabbitmq/README.md). Con el consumidor en marcha, publicar imprime `publicado` y el consumidor imprime el JSON. Con el consumidor parado, la consola muestra `Ready` 1 en la cola `avisos`. Al volver a consumir, pasa a 0.

## Laboratorio

[Trabajos](lab-rabbitmq/README.md). El broker ya está en el Compose. La cola y el mensaje no: en el esqueleto ponen `PON_AQUI_LA_COLA` y `PON_AQUI_LA_TAREA`. La cola del laboratorio es `trabajos` y la tarea es `barrer`. Se publica con el consumidor parado y se ve `Ready` 1 antes de consumir.
