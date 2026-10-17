// El único puerto publicado hacia el host es el 8080, y aquí solo
// está /salud. agenda y tiempo responden en la red de Compose.
import express from 'express';

const app = express();

app.get('/salud', (req, res) => {
  res.json({ ok: true });
});

app.listen(8080, '0.0.0.0', () => console.log('gateway en 8080'));
