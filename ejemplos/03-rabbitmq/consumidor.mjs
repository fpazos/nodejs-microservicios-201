import amqp from 'amqplib';

const conn = await amqp.connect('amqp://guest:guest@127.0.0.1:5672');
const ch = await conn.createChannel();
await ch.assertQueue('avisos', { durable: true });
console.log('esperando avisos');

ch.consume('avisos', (msg) => {
  console.log(msg.content.toString());
  ch.ack(msg);
});
