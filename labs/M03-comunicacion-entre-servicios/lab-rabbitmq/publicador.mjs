// Publica un mensaje y cierra. La cola y el cuerpo siguen como un hueco
// a propósito: tienen que coincidir con lo que escuche el consumidor,
// y ese acuerdo todavía no vive en un solo sitio.
import amqp from 'amqplib';

const conn = await amqp.connect('amqp://guest:guest@127.0.0.1:5672');
const ch = await conn.createChannel();

const cola = 'PON_AQUI_LA_COLA';
await ch.assertQueue(cola, { durable: true });

const cuerpo = JSON.stringify({ tarea: 'PON_AQUI_LA_TAREA' });
ch.sendToQueue(cola, Buffer.from(cuerpo), { persistent: true });
console.log('publicado');
await ch.close();
await conn.close();
