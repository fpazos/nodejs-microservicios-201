# RabbitMQ

El concepto está en [RabbitMQ](../../labs/M03-comunicacion-entre-servicios/01-rabbitmq.md).

## Dónde poner el foco

El publicador deja el aviso en la cola `avisos` y puede terminar. Si el consumidor no está, el mensaje espera ahí. Cuando lo lee, el `ack` es lo que le dice al broker que ya puede quitarlo.

## Archivos

| Archivo | Papel |
|---------|-------|
| `publicador.mjs` | Publica el aviso de la zona `hall` y cierra la conexión |
| `consumidor.mjs` | Lee la cola `avisos` y confirma cada mensaje |
| `package.json` | Scripts `publicar` y `consumir`, dependencia `amqplib` |
| `docker-compose.yml` | Broker RabbitMQ con la consola de gestión |

## El código

### `publicador.mjs`

```js
// Un aviso entra en la cola `avisos` y el proceso se va. La cola durable
// y el mensaje persistent permiten que el aviso espere si el consumidor
// no está. Mira el cierre de canal y conexión: por eso el script termina.
import amqp from 'amqplib';

const conn = await amqp.connect('amqp://guest:guest@127.0.0.1:5672');
const ch = await conn.createChannel();
await ch.assertQueue('avisos', { durable: true });
ch.sendToQueue('avisos', Buffer.from(JSON.stringify({ zona: 'hall' })), { persistent: true });
console.log('publicado');
await ch.close();
await conn.close();
```

### `consumidor.mjs`

```js
// Declara la misma cola que el publicador y se queda escuchando. El ack
// es el momento en que el broker puede quitar el aviso: hasta entonces
// sigue en `avisos`. Mira que el proceso no llama a exit.
import amqp from 'amqplib';

const conn = await amqp.connect('amqp://guest:guest@127.0.0.1:5672');
const ch = await conn.createChannel();
// Mismos nombre y durable que el publicador: declararla dos veces con esos datos es la misma cola.
await ch.assertQueue('avisos', { durable: true });
console.log('esperando avisos');

ch.consume('avisos', (msg) => {
  console.log(msg.content.toString());
  ch.ack(msg);
});
```

## Qué hacer

```bash
cd ejemplos/03-rabbitmq
docker compose up -d
until docker exec ms-rabbit-avisos rabbitmq-diagnostics -q ping; do sleep 2; done
npm install
npm run consumir
```

En otra terminal, desde la misma carpeta:

```bash
npm run publicar
```

La consola del broker está en http://127.0.0.1:15672 (`guest` / `guest`). Para ver que la cola guarda el aviso, para el consumidor (Ctrl+C), publica otra vez y mira la cola `avisos`. `Ready` es 1. Vuelve a arrancar `npm run consumir` y pasa a 0.

## Qué observar

El publicador imprime `publicado` y termina, porque cierra canal y conexión. El consumidor imprime `{"zona":"hall"}` y sigue esperando. Con el consumidor parado, el mensaje persistent permanece en la cola durable hasta que alguien hace `ack`.

## Qué validar

`publicado` en una terminal y `{"zona":"hall"}` en la otra. Con el consumidor parado, la cola `avisos` muestra `Ready` 1.

![cola avisos](../img/03-rabbit.png)
