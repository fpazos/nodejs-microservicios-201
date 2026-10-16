// El POST confirma en PostgreSQL y responde 201 sin esperar a Redis.
// La proyección va 1,5 s después. El GET no mira la tabla: en ese hueco
// la fila ya existe y la respuesta es 404.
import express from 'express';
import { Sequelize, DataTypes } from 'sequelize';
import Redis from 'ioredis';

const sequelize = new Sequelize('postgres://postgres:lab@127.0.0.1:5432/comandas', { logging: false });
const Comanda = sequelize.define('Comanda', {
  id: { type: DataTypes.STRING, primaryKey: true },
  plato: DataTypes.STRING,
}, { tableName: 'comandas', timestamps: false });
await sequelize.sync();

const redis = new Redis('redis://127.0.0.1:6379');
const app = express();

app.post('/comandas', async (req, res) => {
  const comanda = { id: 'C-1', plato: 'sopa' };
  await Comanda.upsert(comanda);
  // Fuera de la respuesta a propósito: el cliente no espera la copia de lectura
  setTimeout(() => {
    redis.set('comanda:C-1', JSON.stringify(comanda));
  }, 1500);
  res.status(201).json(comanda);
});

app.get('/comandas/:id', async (req, res) => {
  // Modelo de lectura distinto del de escritura. Sin clave, 404 aunque el select ya vea la fila.
  const crudo = await redis.get(`comanda:${req.params.id}`);
  if (!crudo) {
    res.status(404).json({ error: 'aun no proyectado' });
    return;
  }
  res.json(JSON.parse(crudo));
});

app.listen(3002, () => console.log('comandas en 3002'));
