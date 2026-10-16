// El contador lo incrementa este proceso; Prometheus solo lo rasca en
// /metrics. Prometheus comparte la red del host y llama a 127.0.0.1:3001.
// Si el proceso cae, up pasa a 0 y la regla AvisosSinRaspado puede dispararse.
import express from 'express';
import client from 'prom-client';

const registro = new client.Registry();
client.collectDefaultMetrics({ register: registro });
const altas = new client.Counter({
  name: 'avisos_total',
  help: 'Avisos publicados',
  registers: [registro], // el mismo registro que sirve /metrics; si no, el contador no sale
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
