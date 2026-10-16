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
