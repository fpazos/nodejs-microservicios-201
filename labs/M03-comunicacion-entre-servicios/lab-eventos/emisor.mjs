import { EventEmitter } from 'node:events';

export const bus = new EventEmitter();

bus.emit('sensor', { sala: 'lab' });
