import express from 'express';

const app = express();

app.get('/salud', (req, res) => {
  res.json({ ok: true });
});

// TODO GET /api/agenda/hoy → http://agenda:3001/hoy
// TODO GET /api/tiempo/manana → http://tiempo:3002/manana
// Reenvía el estado y el cuerpo JSON.

app.listen(8080, '0.0.0.0', () => console.log('gateway en 8080'));
