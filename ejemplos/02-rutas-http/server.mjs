// Una nota en memoria y un verbo por acción. El código HTTP dice si
// la nota se creó, si ya no está o si el id no existía. Al reiniciar
// el proceso el array vuelve a vacío: aquí se mira el verbo, no la
// persistencia.
import express from 'express';

const app = express();
// Sin esto, req.body llega indefinido y la nota se guardaría vacía.
app.use(express.json());

const notas = [];

app.get('/salud', (req, res) => {
  res.json({ ok: true });
});

app.get('/notas', (req, res) => {
  res.json(notas);
});

app.get('/notas/:id', (req, res) => {
  const nota = notas.find((n) => n.id === req.params.id);
  if (!nota) {
    // 404 distingue «ese id no está» de un fallo del proceso.
    res.status(404).json({ error: 'nota no encontrada' });
    return;
  }
  res.json(nota);
});

app.post('/notas', (req, res) => {
  const nota = { id: req.body.id, texto: req.body.texto };
  notas.push(nota);
  // 201: el recurso acaba de crearse. 200 solo diría que la petición fue bien.
  res.status(201).json(nota);
});

app.put('/notas/:id', (req, res) => {
  const nota = notas.find((n) => n.id === req.params.id);
  if (!nota) {
    res.status(404).json({ error: 'nota no encontrada' });
    return;
  }
  // El objeto ya está dentro del array: cambiar texto sustituye la nota.
  nota.texto = req.body.texto;
  res.json(nota);
});

app.delete('/notas/:id', (req, res) => {
  const i = notas.findIndex((n) => n.id === req.params.id);
  if (i === -1) {
    res.status(404).json({ error: 'nota no encontrada' });
    return;
  }
  notas.splice(i, 1);
  // 204 y cuerpo vacío: ya no hay recurso que devolver.
  res.status(204).end();
});

app.listen(3001, () => console.log('notas en 3001'));
