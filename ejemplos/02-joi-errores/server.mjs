import express from 'express';
import Joi from 'joi';

const app = express();
app.use(express.json());

const contactos = [];

const esquema = Joi.object({
  email: Joi.string().email().required(),
  edad: Joi.number().integer().min(0).max(120).required(),
});

function validar(req, res, next) {
  const { error, value } = esquema.validate(req.body, { abortEarly: false, convert: false });
  if (error) {
    next(Object.assign(new Error(error.message), { status: 400 }));
    return;
  }
  req.body = value;
  next();
}

app.post('/contactos', validar, (req, res) => {
  contactos.push(req.body);
  res.status(201).json(req.body);
});

app.get('/romper', () => {
  throw new Error('fallo inesperado');
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.message });
});

app.listen(3001, () => console.log('contactos en 3001'));
