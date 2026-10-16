import express from 'express';
import jwt from 'jsonwebtoken';

const SECRETO = 'secreto-recetas';
const cuentas = { noa: 'chef', ian: 'comensal' };
let plato = 'sopa';

const app = express();
app.use(express.json());

app.get('/recetas/r1', (req, res) => {
  res.json({ id: 'r1', plato });
});

app.put('/recetas/r1', (req, res) => {
  plato = req.body.plato;
  res.json({ id: 'r1', plato });
});

// TODO POST /sesion: body { sub, clave }. La clave válida es lab.
// Firma { sub, rol } con SECRETO, caduca en 15m, y devuelve { token }.
// TODO un middleware exigir(rol) que lea Authorization: Bearer.
// Sin token válido: 401. Con rol distinto del exigido: 403.
// GET exige token de cualquier rol. PUT exige rol chef.

void jwt;
void cuentas;
void SECRETO;

app.listen(3001, () => console.log('recetas en 3001'));
