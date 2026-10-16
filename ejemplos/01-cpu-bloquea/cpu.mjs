// fib(40) corre en el mismo hilo que atiende /salud. La función del
// servidor es async y no hay ningún await: el cálculo sigue hasta el
// final antes de que el bucle pueda escribir `ok`. Mira si /salud
// se adelanta al número o espera con él.
import { createServer } from 'node:http';

function fib(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}

const server = createServer(async (req, res) => {
  if (req.url === '/informe') {
    // 40 es bastante para que la pausa se mida en el curl. El resultado
    // cabe en un número de JavaScript y la respuesta es ese texto.
    res.end(String(fib(40)));
    return;
  }
  res.end('ok');
});

server.listen(3001, () => console.log('cpu en 3001'));
