// El grupo `lectores` es quien guarda el offset. El topic no borra el
// aviso al leerlo: un grupo nuevo puede volver a verlo y este grupo,
// al rearrancar, sigue desde donde lo dejó. Mira `groupId`.
import { Kafka } from 'kafkajs';

const kafka = new Kafka({ clientId: 'lector', brokers: ['127.0.0.1:9092'] });

// El broker tarda en tener el topic. Cada intento usa un consumidor nuevo:
// uno que falló en el subscribe no se reutiliza.
let consumer;
for (let i = 0; i < 20; i += 1) {
  consumer = kafka.consumer({ groupId: 'lectores' });
  try {
    await consumer.connect();
    // fromBeginning cuenta cuando el grupo aún no tiene offset.
    await consumer.subscribe({ topic: 'avisos', fromBeginning: true });
    break;
  } catch (err) {
    try { await consumer.disconnect(); } catch { /* todavía no había sesión */ }
    if (i === 19) throw err;
    await new Promise((r) => setTimeout(r, 1000));
  }
}
console.log('grupo lectores en avisos');

await consumer.run({
  eachMessage: async ({ message }) => {
    console.log(message.value.toString());
  },
});
