import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 3003 });
console.log('ws en 3003');

wss.on('connection', (socket) => {
  socket.send(JSON.stringify({ sala: 'general', texto: 'hola' }));
  socket.on('message', (datos) => {
    const mensaje = JSON.parse(datos.toString());
    socket.send(JSON.stringify({ sala: 'general', texto: mensaje.texto, eco: true }));
  });
});
