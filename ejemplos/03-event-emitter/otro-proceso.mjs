// Este proceso tiene su propio `bus`. Registrar el mismo nombre no
// une los dos programas: no hay cola detrás de la cadena `alarma`.
// El intervalo vacío mantiene el proceso vivo para poder ver el silencio.
import { EventEmitter } from 'node:events';

const bus = new EventEmitter();

bus.on('alarma', (aviso) => {
  console.log('oyente', aviso.zona);
});

// Sin un manejador pendiente, Node saldría al terminar de registrar el oyente.
setInterval(() => {}, 1000);
