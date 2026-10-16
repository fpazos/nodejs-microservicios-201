import mongoose from 'mongoose';

await mongoose.connect('mongodb://127.0.0.1:27017/fichas');
const Ficha = mongoose.model('Ficha', new mongoose.Schema({
  codigo: { type: String, unique: true },
  nombre: String,
}));
await Ficha.findOneAndUpdate(
  { codigo: 'F-1' },
  { codigo: 'F-1', nombre: 'ficha azul' },
  { upsert: true },
);
console.log('semilla lista');
await mongoose.disconnect();
