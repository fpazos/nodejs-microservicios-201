import express from 'express';
import pino from 'pino';

const log = pino();
const app = express();
app.post('/notas', (req, res) => {
  log.info({ id: 'n1' }, 'nota creada');
  res.status(201).json({ id: 'n1' });
});
app.listen(3001, '0.0.0.0', () => console.log('notas en 3001'));
