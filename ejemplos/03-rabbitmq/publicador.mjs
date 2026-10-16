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
