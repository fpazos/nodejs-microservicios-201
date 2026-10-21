// /csv exporta 10 bloques de 20 KB, uno cada 200 ms: 2 segundos en total.
// /resumen es corto. El gateway del punto de partida solo conoce /csv.
import express from 'express';

const app = express();
app.get('/csv', async (req, res) => {
  res.type('text/csv');
  for (let i = 1; i <= 10; i += 1) {
    res.write(`${i};`.padEnd(20 * 1024 - 1, '0') + '\n');
    await new Promise((r) => setTimeout(r, 200));
  }
  res.end();
});
app.get('/resumen', (req, res) => {
  res.json({ facturas: 10, total: 1250 });
});
app.listen(3001, '0.0.0.0', () => console.log('facturas en 3001'));
