import express from 'express';

const app = express();
let votos = 0;

app.post('/votos', (req, res) => {
  votos += 1;
  res.status(201).json({ votos });
});

// TODO cuenta avisos con prom-client en un Counter votos_total
// y exponlo en GET /metrics.
// El número `votos` de esta variable no lo ve Prometheus.

app.listen(3001, '0.0.0.0', () => console.log('votos en 3001'));
