// Punto de partida: el gateway de la página 06. Espera el CSV entero y
// luego lo manda. Este fichero está montado: al guardarlo, --watch reinicia.
import express from 'express';

const app = express();

app.get('/salud', (req, res) => {
  res.json({ ok: true });
});

app.get('/api/facturas/csv', async (req, res) => {
  const respuesta = await fetch('http://facturas:3001/csv');
  const texto = await respuesta.text();
  res.status(respuesta.status).type('text/csv').send(texto);
});

app.listen(8080, '0.0.0.0', () => console.log('gateway en 8080'));
