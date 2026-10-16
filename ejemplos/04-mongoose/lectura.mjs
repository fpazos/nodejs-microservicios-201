import mongoose from 'mongoose';

await mongoose.connect('mongodb://127.0.0.1:27017/libros');
const Libro = mongoose.model('Libro', new mongoose.Schema({
  isbn: String,
  titulo: String,
}));
console.log(await Libro.findOne({ isbn: '978-1' }).lean());
await mongoose.disconnect();
