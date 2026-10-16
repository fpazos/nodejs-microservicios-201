import express from 'express';

const app = express();
app.get('/hola', (req, res) => {
  res.json({ mensaje: 'hola', host: process.env.HOSTNAME || 'local' });
});
app.listen(3001, '0.0.0.0', () => console.log('hola en 3001'));
