// El almacén responde /huecos y /salud en el 3002 de este contenedor.
// El host no publica el puerto. HAProxy lo llama por el nombre almacen.
import express from 'express';

const app = express();

app.get('/salud', (req, res) => {
  res.json({ ok: true });
});

app.get('/huecos', (req, res) => {
  res.json({ huecos: 12 });
});

app.use((req, res) => {
  res.status(404).json({ error: 'no esta' });
});

app.listen(3002, '0.0.0.0', () => console.log('almacen en 3002'));
