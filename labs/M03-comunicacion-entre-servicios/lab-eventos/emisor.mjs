// Este proceso crea su propio bus y emite `sensor` enseguida.
// Nadie se ha registrado en este objeto, así que el aviso no se imprime
// y el proceso termina.
import { EventEmitter } from 'node:events';

export const bus = new EventEmitter();

bus.emit('sensor', { sala: 'lab' });
