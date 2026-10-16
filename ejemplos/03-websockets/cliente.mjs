import WebSocket from 'ws';

const ws = new WebSocket('ws://127.0.0.1:3003');

ws.on('open', () => {
  ws.send(JSON.stringify({ texto: 'buenos dias' }));
});

ws.on('message', (datos) => {
  console.log(datos.toString());
});
