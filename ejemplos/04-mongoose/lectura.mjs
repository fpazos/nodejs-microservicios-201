// Otro proceso, sin el objeto del alta. El esquema no repite unique:
// aquí no se inserta, solo se pregunta por el isbn que el otro dejó.
import mongoose from 'mongoose';

await mongoose.connect('mongodb://127.0.0.1:27017/libros');
const Libro = mongoose.model('Libro', new mongoose.Schema({
  isbn: String,
  titulo: String,
}));
// lean devuelve los campos guardados, sin envolverlos en un documento
console.log(await Libro.findOne({ isbn: '978-1' }).lean());
await mongoose.disconnect();
