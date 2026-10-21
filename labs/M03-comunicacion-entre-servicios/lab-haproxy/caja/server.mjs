// La caja responde /abierta y /salud en el 3001 de este contenedor.
// CAJA vale 1 o 2 según el servicio de Compose. El host no publica el puerto:
// quien llama es HAProxy, por el nombre caja-1 o caja-2.
import express from 'express';

const caja = process.env.CAJA;
const app = express();

app.get('/salud', (req, res) => {
  res.json({ ok: true });
});

app.get('/abierta', (req, res) => {
  res.json({ caja });
});

app.use((req, res) => {
  res.status(404).json({ error: 'no esta' });
});

app.listen(3001, '0.0.0.0', () => console.log(`caja ${caja} en 3001`));
