// Cada GET lee Mongo y lo escribe en el log. Redis está conectado
// y este manejador no lo consulta, así que la segunda lectura
// repite el mismo viaje.
import express from 'express';
import mongoose from 'mongoose';
import Redis from 'ioredis';

await mongoose.connect('mongodb://127.0.0.1:27017/peliculas');
const Pelicula = mongoose.model('Pelicula', new mongoose.Schema({
  id: String,
  titulo: String,
}));
const redis = new Redis('redis://127.0.0.1:6379');
const app = express();

app.get('/peliculas/:id', async (req, res) => {
  const doc = await Pelicula.findOne({ id: req.params.id }).lean();
  if (!doc) {
    res.status(404).json({ error: 'no encontrada' });
    return;
  }
  console.log('mongo', req.params.id);
  res.json(doc);
});

app.listen(3001, () => console.log('peliculas en 3001'));
