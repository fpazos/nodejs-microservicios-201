import mongoose from 'mongoose';

await mongoose.connect('mongodb://127.0.0.1:27017/peliculas');
const Pelicula = mongoose.model('Pelicula', new mongoose.Schema({
  id: { type: String, unique: true },
  titulo: String,
}));
await Pelicula.findOneAndUpdate(
  { id: 'p1' },
  { id: 'p1', titulo: 'El faro' },
  { upsert: true },
);
console.log('semilla lista');
await mongoose.disconnect();
