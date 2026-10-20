// Otro proceso, otro bus. El intervalo solo mantiene el proceso vivo
// para que puedas mirar esta terminal mientras el emisor corre en la otra.
import { EventEmitter } from 'node:events';

const bus = new EventEmitter();

// Este on cuelga del bus de este proceso. El emit del emisor usa otro
// objeto, así que esta función no llega a imprimir `sala lab`.
bus.on('sensor', (aviso) => {
  console.log('sala', aviso.sala);
});

setInterval(() => {}, 1000);
