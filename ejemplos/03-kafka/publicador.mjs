// El aviso va al topic `avisos`. El broker de Compose tarda en aceptar
// conexiones, así que el connect se reintenta y el último fallo sí se
// propaga. Al desconectar, el proceso termina: el mensaje se queda en el topic.
import { Kafka } from 'kafkajs';

const kafka = new Kafka({ clientId: 'editor', brokers: ['127.0.0.1:9092'] });
const producer = kafka.producer();

for (let i = 0; i < 15; i += 1) {
  try {
    await producer.connect();
    break;
  } catch (err) {
    if (i === 14) throw err;
    await new Promise((r) => setTimeout(r, 2000));
  }
}

await producer.send({
  topic: 'avisos',
  messages: [{ value: JSON.stringify({ zona: 'hall' }) }],
});
console.log('publicado');
await producer.disconnect();
