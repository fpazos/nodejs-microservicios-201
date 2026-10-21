// El informe no está hecho de antemano: sale en 10 trozos de 20 KB, uno
// cada 200 ms. Generarlo entero cuesta 2 segundos. Mira res.write: cada
// trozo sale por el socket en cuanto existe, sin esperar al siguiente.
import express from 'express';

const TROZOS = 10;
const TAM = 20 * 1024;

const app = express();
app.get('/informe', async (req, res) => {
  res.type('text/plain');
  for (let i = 1; i <= TROZOS; i += 1) {
    res.write(`${String(i).padStart(2, '0')} `.padEnd(TAM - 1, '.') + '\n');
    await new Promise((r) => setTimeout(r, 200));
  }
  res.end();
});
app.listen(3001, '0.0.0.0', () => console.log('informe en 3001'));
