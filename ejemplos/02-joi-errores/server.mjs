// El cuerpo se juzga antes de entrar en el array. El fallo de Joi y
// la excepción de /romper salen por el mismo middleware, con distinto
// código. Mira el status que viaja en el error y la función de cuatro
// argumentos que lo convierte en HTTP.
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
  // abortEarly en false junta todos los campos malos en una sola respuesta.
  // convert en false exige que edad ya sea número: una cadena numérica no pasa.
  const { error, value } = esquema.validate(req.body, { abortEarly: false, convert: false });
  if (error) {
    // next(error) deja la respuesta al middleware final. El 400 marca fallo del cliente.
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
  // Express 5 entrega esta excepción al middleware de error. El proceso sigue.
  throw new Error('fallo inesperado');
});

// Cuatro argumentos: Express solo entonces la trata como manejador de errores.
// Un throw sin status sale como 500.
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.message });
});

app.listen(3001, () => console.log('contactos en 3001'));
