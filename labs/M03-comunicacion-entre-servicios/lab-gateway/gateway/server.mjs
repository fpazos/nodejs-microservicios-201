// El único puerto publicado hacia el host es el 8080, y aquí solo
// está /salud. agenda y tiempo responden en la red de Compose.
import express from 'express';
// montar añade las rutas que reenvían. /salud sigue siendo la de este fichero.
import { montar } from './rutas.mjs';


const app = express();

app.get('/salud', (req, res) => {
  res.json({ ok: true });
});
// Las rutas de dentro se cuelgan aquí. /salud ya estaba y se queda.
montar(app);

app.listen(8080, '0.0.0.0', () => console.log('gateway en 8080'));
