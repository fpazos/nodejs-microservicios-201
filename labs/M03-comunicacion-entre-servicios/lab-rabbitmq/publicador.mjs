// Publica un mensaje y cierra. La cola y el cuerpo siguen como un hueco
// a propósito: tienen que coincidir con lo que escuche el consumidor,
// y ese acuerdo todavía no vive en un solo sitio.
import amqp from 'amqplib';
import { cola, cuerpo, cuerpo2, cuerpo3, cuerpo4 } from './mensaje.mjs';

const conn = await amqp.connect('amqp://guest:guest@127.0.0.1:5672');
const ch = await conn.createChannel();

// Crea `trabajos` si no existe. durable deja la cola en el broker
// para que el mensaje pueda esperar con el consumidor parado.
await ch.assertQueue(cola, { durable: true });

ch.sendToQueue(cola, Buffer.from(cuerpo), { persistent: true });
// ch.sendToQueue(cola, Buffer.from(cuerpo2), { persistent: true });
// ch.sendToQueue(cola, Buffer.from(cuerpo3), { persistent: true });
// ch.sendToQueue(cola, Buffer.from(cuerpo4), { persistent: true });
console.log('publicado');
await ch.close();
await conn.close();
