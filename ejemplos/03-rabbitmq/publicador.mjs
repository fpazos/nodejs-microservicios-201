import amqp from 'amqplib';

const conn = await amqp.connect('amqp://guest:guest@127.0.0.1:5672');
const ch = await conn.createChannel();
await ch.assertQueue('avisos', { durable: true });
ch.sendToQueue('avisos', Buffer.from(JSON.stringify({ zona: 'hall' })), { persistent: true });
console.log('publicado');
await ch.close();
await conn.close();
