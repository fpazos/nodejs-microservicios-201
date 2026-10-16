import express from 'express';
import jwt from 'jsonwebtoken';

const SECRETO = 'secreto-articulos';
const cuentas = { eva: 'editor', leo: 'lector' };
let titulo = 'borrador';

const app = express();
app.use(express.json());

app.post('/sesion', (req, res) => {
  const rol = cuentas[req.body.sub];
  if (!rol || req.body.clave !== 'lab') {
    res.status(401).json({ error: 'credenciales' });
    return;
  }
  res.json({ token: jwt.sign({ sub: req.body.sub, rol }, SECRETO, { expiresIn: '15m' }) });
});

function exigir(rolExigido) {
  return (req, res, next) => {
    const cabecera = req.header('authorization') || '';
    const token = cabecera.startsWith('Bearer ') ? cabecera.slice(7) : '';
    try {
      const payload = jwt.verify(token, SECRETO);
      if (rolExigido && payload.rol !== rolExigido) {
        res.status(403).json({ error: 'rol insuficiente' });
        return;
      }
      req.usuario = payload;
      next();
    } catch {
      res.status(401).json({ error: 'token no valido' });
    }
  };
}

app.get('/articulos/a1', exigir(), (req, res) => {
  res.json({ id: 'a1', titulo, sub: req.usuario.sub });
});

app.put('/articulos/a1', exigir('editor'), (req, res) => {
  titulo = req.body.titulo;
  res.json({ id: 'a1', titulo });
});

app.listen(3001, () => console.log('articulos en 3001'));
