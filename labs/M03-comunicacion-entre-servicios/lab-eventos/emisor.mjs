// Este proceso crea su propio bus y emite `sensor` enseguida.
// Nadie se ha registrado en este objeto, así que el aviso no se imprime
// y el proceso termina.
import { EventEmitter } from 'node:events';
// escuchar registra el on en el bus de este fichero, no en el de otro proceso.
import { escuchar } from './escucha.mjs';

export const bus = new EventEmitter();

bus.emit('sensor', { sala: 'lab' });

// Primero el oyente, después el aviso. El objeto es `bus`, el de este fichero.
escuchar(bus);
bus.emit('sensor', { sala: 'lab', nombre: 'principal' });
bus.emit('puerta', { nombre: 'principal' });
