// Este proceso solo conoce /hoy y /salud. El prefijo /api/avisos lo quita
// HAProxy. Escucha el 3002 de su contenedor. El host no publica ese puerto.
import express from 'express';

const app = express();

app.get('/salud', (req, res) => {
  res.json({ ok: true });
});

app.get('/hoy', (req, res) => {
  res.json({ texto: 'cierra a las 21' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'no esta' });
});

app.listen(3002, '0.0.0.0', () => console.log('avisos en 3002'));
