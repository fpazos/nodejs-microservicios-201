// 0.0.0.0: en 127.0.0.1 el -p del host no entra, porque esa interfaz es
// solo el interior del contenedor. HOSTNAME lo rellena el runtime; fuera
// de Docker cae en `local`.
import express from 'express';

const app = express();
app.get('/hola', (req, res) => {
  res.json({ mensaje: 'hola', host: process.env.HOSTNAME || 'local' });
});
app.listen(3001, '0.0.0.0', () => console.log('hola en 3001'));
