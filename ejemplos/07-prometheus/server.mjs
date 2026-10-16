import express from 'express';
import client from 'prom-client';

const registro = new client.Registry();
client.collectDefaultMetrics({ register: registro });
const altas = new client.Counter({
  name: 'avisos_total',
  help: 'Avisos publicados',
  registers: [registro],
});

const app = express();
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', registro.contentType);
  res.end(await registro.metrics());
});
app.post('/avisos', (req, res) => {
  altas.inc();
  res.status(201).json({ ok: true });
});
app.listen(3001, '0.0.0.0', () => console.log('avisos en 3001'));
