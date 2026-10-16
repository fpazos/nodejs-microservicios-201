# Kafka

[← RabbitMQ](01-rabbitmq.md) · [Siguiente página →](03-grpc.md)

El topic guarda el mensaje. Leerlo no lo borra. El grupo de consumidores guarda un offset: el sitio hasta el que ese grupo ya leyó. El grupo `lectores` que ya pasó por el aviso no lo vuelve a imprimir si arranca otra vez. Un grupo nuevo, `auditoria`, lee desde su propio sitio y sí lo vuelve a ver. El topic es el mismo.

El aviso del ejemplo es otra vez `{"zona":"hall"}`, en el topic `avisos`. El broker es un nodo en modo KRaft. El publicador reintenta la conexión porque el primer arranque tarda.

| | RabbitMQ en la página anterior | Kafka aquí |
|--|--------------------------------|------------|
| Dónde está el mensaje | Cola `avisos` | Topic `avisos` |
| Al leerlo | El `ack` lo saca de la cola | El mensaje sigue; el grupo avanza el offset |
| Quién más puede leerlo | Otro consumidor de la misma cola se reparte los mensajes | Otro grupo lee el topic por su cuenta |

## Ejemplo

La demostración está en [Kafka](../../ejemplos/03-kafka/README.md). Publicar y consumir muestran el mismo JSON. Parar el consumidor y arrancarlo sin publicar no reimprime el aviso. Cambiar el `groupId` a `auditoria` sí lo relee.

La cola se practica en el [laboratorio de RabbitMQ](lab-rabbitmq/README.md). Kafka se ejecuta. No tiene laboratorio propio.
