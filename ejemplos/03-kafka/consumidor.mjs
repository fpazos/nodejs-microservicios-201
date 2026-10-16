import { Kafka } from 'kafkajs';

const kafka = new Kafka({ clientId: 'lector', brokers: ['127.0.0.1:9092'] });
const consumer = kafka.consumer({ groupId: 'lectores' });

await consumer.connect();
await consumer.subscribe({ topic: 'avisos', fromBeginning: true });
console.log('grupo lectores en avisos');

await consumer.run({
  eachMessage: async ({ message }) => {
    console.log(message.value.toString());
  },
});
