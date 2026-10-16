import express from 'express';
import { Sequelize, DataTypes } from 'sequelize';
import Redis from 'ioredis';

const sequelize = new Sequelize('postgres://postgres:lab@127.0.0.1:5432/turnos', { logging: false });
const Turno = sequelize.define('Turno', {
  id: { type: DataTypes.STRING, primaryKey: true },
  mesa: DataTypes.STRING,
}, { tableName: 'turnos', timestamps: false });
await sequelize.sync();

const redis = new Redis('redis://127.0.0.1:6379');
const app = express();

app.post('/turnos', async (req, res) => {
  const turno = { id: 'T-1', mesa: '4' };
  await Turno.upsert(turno);
  res.status(201).json(turno);
});

app.get('/turnos/:id', async (req, res) => {
  const fila = await Turno.findByPk(req.params.id);
  if (!fila) {
    res.status(404).json({ error: 'no existe' });
    return;
  }
  res.json(fila.toJSON());
  // TODO: este GET no debe leer PostgreSQL.
  // Lee la clave turno:<id> en redis.
  // Si no está, 404 con { error: 'aun no proyectado' }.
  // En el POST, copia el turno a esa clave 1,5 s después del upsert.
  void redis;
});

app.listen(3002, () => console.log('turnos en 3002'));
