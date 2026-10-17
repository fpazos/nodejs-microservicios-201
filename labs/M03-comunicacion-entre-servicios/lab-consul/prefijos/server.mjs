// Responde el código y la salud. `consul` trae la dirección del agente
// y este fichero todavía no la usa: al arrancar no se anuncia en el listín.
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
