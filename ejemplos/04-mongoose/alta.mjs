import mongoose from 'mongoose';

await mongoose.connect('mongodb://127.0.0.1:27017/libros');

const Libro = mongoose.model('Libro', new mongoose.Schema({
  isbn: { type: String, required: true, unique: true },
  titulo: String,
}));

const doc = await Libro.findOneAndUpdate(
  { isbn: '978-1' },
  { isbn: '978-1', titulo: 'El mapa' },
  { upsert: true, new: true },
);
console.log(doc.toJSON());
await mongoose.disconnect();
