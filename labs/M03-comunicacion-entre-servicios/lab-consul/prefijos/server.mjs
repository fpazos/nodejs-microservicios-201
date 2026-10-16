import express from 'express';

const consul = process.env.CONSUL_HTTP_ADDR;
const app = express();

app.get('/salud', (req, res) => {
  res.json({ ok: true });
});

app.get('/codigo', (req, res) => {
  res.json({ codigo: '+34' });
});

app.listen(3001, '0.0.0.0', () => {
  console.log('prefijos en 3001');
});
