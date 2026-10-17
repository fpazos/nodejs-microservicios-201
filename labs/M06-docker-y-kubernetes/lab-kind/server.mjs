// Devuelve el hostname del contenedor. Quien reparte entre Pods
// es el Service; este proceso solo dice cómo se llama.
import express from 'express';

const app = express();
app.get('/eco', (req, res) => {
  res.json({ pod: process.env.HOSTNAME || 'local' });
});
app.listen(3001, '0.0.0.0', () => console.log('eco en 3001'));
