// Este proceso solo conoce /turno y /salud. El prefijo /api/mostrador
// lo quita HAProxy. MOSTRADOR distingue las dos copias: las dos escuchan
// el 3001 de su contenedor, y el host no publica ese puerto.
import express from 'express';

const mostrador = process.env.MOSTRADOR;
const app = express();

app.get('/salud', (req, res) => {
  res.json({ ok: true });
});

app.get('/turno', (req, res) => {
  res.json({ mostrador });
});

app.use((req, res) => {
  res.status(404).json({ error: 'no esta' });
});

app.listen(3001, '0.0.0.0', () => console.log(`mostrador ${mostrador} en 3001`));
