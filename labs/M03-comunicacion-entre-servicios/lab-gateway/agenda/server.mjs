// La cita de hoy. Este puerto no se publica en el host: lo usa
// quien comparte la red de Compose con este proceso.
import express from 'express';

const app = express();
app.get('/hoy', (req, res) => {
  res.json({ cita: 'dentista' });
});
app.listen(3001, '0.0.0.0', () => console.log('agenda en 3001'));
