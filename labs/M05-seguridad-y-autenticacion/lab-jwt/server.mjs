// Cualquiera lee y cambia `plato`. El cuerpo del PUT se acepta
// sin mirar quién llama.
import express from 'express';

const app = express();
app.use(express.json());

let plato = 'sopa';

app.get('/recetas/r1', (req, res) => {
  res.json({ id: 'r1', plato });
});

app.put('/recetas/r1', (req, res) => {
  plato = req.body.plato;
  res.json({ id: 'r1', plato });
});

app.listen(3001, () => console.log('recetas en 3001'));
