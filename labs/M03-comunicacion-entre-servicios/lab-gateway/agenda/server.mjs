import express from 'express';

const app = express();
app.get('/hoy', (req, res) => {
  res.json({ cita: 'dentista' });
});
app.listen(3001, '0.0.0.0', () => console.log('agenda en 3001'));
