// HOSTNAME en el Pod es el nombre del Pod: así se ve a cuál respondió el
// Service. 0.0.0.0 porque el port-forward llega por la red del Pod, no
// por el loopback del proceso.
import express from 'express';

const app = express();
app.get('/eco', (req, res) => {
  res.json({ pod: process.env.HOSTNAME || 'local' });
});
app.listen(3001, '0.0.0.0', () => console.log('eco en 3001'));
