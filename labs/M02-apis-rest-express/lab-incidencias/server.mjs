import express from 'express';

const app = express();
app.use(express.json());

export const incidencias = [];

app.get('/salud', (req, res) => {
  res.json({ ok: true });
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.message });
});

app.listen(3001, () => console.log('incidencias en 3001'));
