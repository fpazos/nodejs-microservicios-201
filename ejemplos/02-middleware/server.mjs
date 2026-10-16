import express from 'express';
import morgan from 'morgan';
import compression from 'compression';

const app = express();
app.use(morgan('tiny'));
app.use(compression());

const informes = [{ id: 'i1', titulo: 'cierre de marzo' }];

function apiKey(req, res, next) {
  if (req.header('x-api-key') !== 'clave-informes') {
    res.status(401).json({ error: 'falta la clave' });
    return;
  }
  next();
}

app.get('/salud', (req, res) => {
  res.json({ ok: true });
});

app.get('/informes', apiKey, (req, res) => {
  res.json(informes);
});

app.listen(3001, () => console.log('informes en 3001'));
