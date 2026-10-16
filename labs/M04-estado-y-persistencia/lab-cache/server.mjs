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
  // TODO: antes de ir a Mongo, mira la clave pelicula:<id> en redis.
  // Si está, responde y no leas Mongo. Si no está, después de leer guarda la clave 60 segundos.
  void redis;
});

app.listen(3001, () => console.log('peliculas en 3001'));
