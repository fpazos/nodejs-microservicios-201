// El proceso escribe y termina. El libro no se queda en esta memoria:
// upsert lo deja en MongoDB, y unique impide un segundo documento con
// el mismo isbn si se vuelve a lanzar el alta.
import mongoose from 'mongoose';

await mongoose.connect('mongodb://127.0.0.1:27017/libros');

const Libro = mongoose.model('Libro', new mongoose.Schema({
  isbn: { type: String, required: true, unique: true },
  titulo: String,
}));

const doc = await Libro.findOneAndUpdate(
  { isbn: '978-1' },
  { isbn: '978-1', titulo: 'El mapa' },
  // new: el log muestra lo guardado. Sin ello, el primer insert devolvería null.
  { upsert: true, new: true },
);
console.log(doc.toJSON());
await mongoose.disconnect();
