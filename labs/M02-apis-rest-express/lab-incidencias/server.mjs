// Este proceso solo responde /salud. La lista nace vacía y vive en
// memoria: al reiniciar, las incidencias que hubieras creado desaparecen.
// El middleware de cuatro argumentos convierte un error con status en el
// código HTTP. Si el error no trae status, la respuesta es 500.
import express from 'express';
import { validar } from './validar.mjs';
import { montar } from './ruta.mjs';

const app = express();
app.use(express.json());

export const incidencias = [];

montar(app, validar, incidencias);

app.get('/salud', validar, (req, res) => {
  res.json({ ok: true });
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.message });
});

montar(app, validar, incidencias);



app.listen(3001, () => console.log('incidencias en 3001'));

