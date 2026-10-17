// Otro proceso, otro bus. El intervalo solo mantiene el proceso vivo
// para que puedas mirar esta terminal mientras el emisor corre en la otra.
import { EventEmitter } from 'node:events';

const bus = new EventEmitter();

setInterval(() => {}, 1000);
