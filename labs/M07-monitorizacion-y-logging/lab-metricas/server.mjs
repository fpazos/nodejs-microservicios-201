// `votos` vive en este proceso y sale en el JSON del POST.
// Prometheus no puede leer una variable: en este fichero no hay /metrics.
import express from 'express';

const app = express();
let votos = 0;

app.post('/votos', (req, res) => {
  votos += 1;
  res.status(201).json({ votos });
});

app.listen(3001, '0.0.0.0', () => console.log('votos en 3001'));
