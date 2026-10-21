// Responde el código y la salud. `consul` trae la dirección del agente
// y este fichero todavía no la usa: al arrancar no se anuncia en el listín.
import express from 'express';
// registrar usa la dirección del agente, la que ya está en `consul`.
import { registrar } from './registro.mjs';


const consul = process.env.CONSUL_HTTP_ADDR;
const app = express();

app.get('/salud', (req, res) => {
  res.json({ ok: true });
});

app.get('/codigo', (req, res) => {
  res.json({ codigo: '+34' });
});

// Primero escucha, después se anuncia. Si el PUT fuera antes del listen,
// el check de Consul encontraría el puerto cerrado.
app.listen(3001, '0.0.0.0', async () => {
  console.log('prefijos en 3001');
  await registrar(consul);
});

