// La espera de /plazo queda anotada y el hilo se suelta. /salud puede
// responder mientras el plazo sigue abierto. El temporizador ocupa el
// lugar de una respuesta de red que todavía no ha llegado.
import { createServer } from 'node:http';

const server = createServer((req, res) => {
  if (req.url === '/plazo') {
    // Al registrar el plazo la función vuelve enseguida. La respuesta
    // se cierra tres segundos después, en otro turno del bucle.
    setTimeout(() => res.end('plazo-listo'), 3000);
    // Sin este return, la misma petición también escribiría `ok`.
    return;
  }
  res.end('ok');
});

server.listen(3001, () => console.log('red en 3001'));
