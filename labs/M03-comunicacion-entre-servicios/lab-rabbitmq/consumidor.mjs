// Se queda escuchando. Cuando llega un mensaje lo imprime y hace ack,
// que es lo que lo saca de Ready. El nombre de la cola, debajo, es un hueco.
import amqp from 'amqplib';

const conn = await amqp.connect('amqp://guest:guest@127.0.0.1:5672');
const ch = await conn.createChannel();

const cola = 'PON_AQUI_LA_COLA';
await ch.assertQueue(cola, { durable: true });
console.log('esperando', cola);

ch.consume(cola, (msg) => {
  console.log(msg.content.toString());
  ch.ack(msg);
});
