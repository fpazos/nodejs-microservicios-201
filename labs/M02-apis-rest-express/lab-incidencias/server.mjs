import express from 'express';
import Joi from 'joi';

const app = express();
app.use(express.json());

const incidencias = [];

app.get('/salud', (req, res) => {
  res.json({ ok: true });
});

// TODO esquema: id (string obligatorio), titulo (string min 1), gravedad (alta, media o baja).

// TODO POST /incidencias: validar, 409 si el id ya existe, 201 si se crea.

// TODO GET /incidencias/:id: 200 o 404.

// TODO PUT /incidencias/:id: sustituye titulo y gravedad, 200 o 404.

// TODO DELETE /incidencias/:id: 204 o 404.

// TODO middleware: la cabecera x-api-key tiene que ser lab-incidencias en POST, PUT y DELETE.
// GET y /salud siguen sin clave.

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.message });
});

app.listen(3001, () => console.log('incidencias en 3001'));
