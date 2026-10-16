import express from 'express';

const app = express();
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
    res.status(404).json({ error: 'nota no encontrada' });
    return;
  }
  res.json(nota);
});

app.post('/notas', (req, res) => {
  const nota = { id: req.body.id, texto: req.body.texto };
  notas.push(nota);
  res.status(201).json(nota);
});

app.put('/notas/:id', (req, res) => {
  const nota = notas.find((n) => n.id === req.params.id);
  if (!nota) {
    res.status(404).json({ error: 'nota no encontrada' });
    return;
  }
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
  res.status(204).end();
});

app.listen(3001, () => console.log('notas en 3001'));
