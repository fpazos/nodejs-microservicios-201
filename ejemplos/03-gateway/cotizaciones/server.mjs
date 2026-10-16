import express from 'express';

const app = express();
app.get('/usd', (req, res) => {
  res.json({ par: 'EURUSD', valor: 1.08 });
});
app.listen(3002, '0.0.0.0', () => console.log('cotizaciones en 3002'));
