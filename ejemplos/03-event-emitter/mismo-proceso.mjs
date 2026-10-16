import { EventEmitter } from 'node:events';

const bus = new EventEmitter();

bus.on('alarma', (aviso) => {
  console.log('oyente', aviso.zona);
});

bus.emit('alarma', { zona: 'hall' });
