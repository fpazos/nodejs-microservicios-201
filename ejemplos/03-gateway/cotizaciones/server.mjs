// Misma idea que clima, con otro puerto dentro de la red. 3002 solo lo
// usa el gateway al pedir /usd. El cliente de fuera llama a /api/cotizaciones/usd
// en el 8080 y no necesita saber este puerto.
import express from 'express';

const app = express();
app.get('/usd', (req, res) => {
  res.json({ par: 'EURUSD', valor: 1.08 });
});
app.listen(3002, '0.0.0.0', () => console.log('cotizaciones en 3002'));
