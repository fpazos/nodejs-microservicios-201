import { createServer } from 'node:http';

const server = createServer((req, res) => {
  if (req.url === '/plazo') {
    setTimeout(() => res.end('plazo-listo'), 3000);
    return;
  }
  res.end('ok');
});

server.listen(3001, () => console.log('red en 3001'));
