// El texto se envía cuando el canal ya está abierto. Antes de `open`
// el handshake no ha terminado. Las dos líneas que llegan (saludo y eco)
// salen por el mismo manejador message. El proceso se queda en el canal.
import WebSocket from 'ws';

const ws = new WebSocket('ws://127.0.0.1:3003');

ws.on('open', () => {
  ws.send(JSON.stringify({ texto: 'buenos dias' }));
});

ws.on('message', (datos) => {
  console.log(datos.toString());
});
