// La espera de /plazo ocurre dentro del único hilo. Mientras el bucle
// no termina, el proceso no vuelve a mirar la cola de peticiones: /salud
// llega y se queda esperando. Fíjate en el while, no en el texto de la respuesta.
import { createServer } from 'node:http';

const server = createServer((req, res) => {
  if (req.url === '/plazo') {
    const hasta = Date.now() + 3000;
    // Tres segundos de CPU vacía. El temporizador devolvería el control;
    // este bucle lo retiene hasta que el reloj pasa de `hasta`.
    while (Date.now() < hasta) {}
    res.end('plazo-listo');
    return;
  }
  res.end('ok');
});

server.listen(3001, () => console.log('bloqueante en 3001'));
