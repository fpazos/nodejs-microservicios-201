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
  // TODO: registrarse en Consul cuando este proceso ya escucha.
  // Name: prefijos
  // ID: prefijos-1
  // Address: 127.0.0.1
  // Port: 3001
  // Check HTTP: http://prefijos:3001/salud cada 5s
  // PUT ${consul}/v1/agent/service/register
  void consul;
});
