// Quien escucha y quien emite comparten este objeto `bus`, en este
// proceso. El nombre `alarma` solo existe aquí. Mira que el oyente
// corre en el mismo turno que emit, y el programa termina al acabar.
import { EventEmitter } from 'node:events';

const bus = new EventEmitter();

bus.on('alarma', (aviso) => {
  console.log('oyente', aviso.zona);
});

bus.emit('alarma', { zona: 'hall' });
