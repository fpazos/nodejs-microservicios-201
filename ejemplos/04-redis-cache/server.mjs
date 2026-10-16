import express from 'express';
import mongoose from 'mongoose';
import Redis from 'ioredis';

await mongoose.connect('mongodb://127.0.0.1:27017/fichas');
const Ficha = mongoose.model('Ficha', new mongoose.Schema({ codigo: String, nombre: String }));
const redis = new Redis('redis://127.0.0.1:6379');
const app = express();

app.get('/fichas/:codigo', async (req, res) => {
  const clave = `ficha:${req.params.codigo}`;
  const cacheado = await redis.get(clave);
  if (cacheado) {
    console.log('redis', clave);
    res.json(JSON.parse(cacheado));
    return;
  }
  const doc = await Ficha.findOne({ codigo: req.params.codigo }).lean();
  if (!doc) {
    res.status(404).json({ error: 'ficha no encontrada' });
    return;
  }
  console.log('mongo', clave);
  await redis.set(clave, JSON.stringify(doc), 'EX', 60);
  res.json(doc);
});

app.listen(3001, () => console.log('fichas en 3001'));
