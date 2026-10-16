// morgan y compression rodean todas las rutas. La clave solo entra
// en /informes: /salud tiene que responder sin ella. Mira qué función
// va en app.use y cuál va como argumento de una sola ruta.
import express from 'express';
import morgan from 'morgan';
import compression from 'compression';

const app = express();
// Una línea por petición, con método, ruta y código, sin repetir el log en cada handler.
app.use(morgan('tiny'));
// Negocia gzip si el cliente manda Accept-Encoding. Si no lo manda, el cuerpo sigue en JSON claro.
app.use(compression());

const informes = [{ id: 'i1', titulo: 'cierre de marzo' }];

function apiKey(req, res, next) {
  if (req.header('x-api-key') !== 'clave-informes') {
    res.status(401).json({ error: 'falta la clave' });
    // El return corta la cadena: sin él, next() ejecutaría también el handler.
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
