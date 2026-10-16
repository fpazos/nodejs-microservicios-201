import { createServer } from 'node:http';

function fib(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}

const server = createServer(async (req, res) => {
  if (req.url === '/informe') {
    res.end(String(fib(40)));
    return;
  }
  res.end('ok');
});

server.listen(3001, () => console.log('cpu en 3001'));
