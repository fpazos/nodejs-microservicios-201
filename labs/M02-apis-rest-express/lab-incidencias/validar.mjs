import Joi from 'joi';

// Una incidencia trae id, titulo y gravedad. Los tres son obligatorios
// y gravedad solo admite alta, media o baja. El esquema rechaza el cuerpo
// antes de que la ruta lo guarde.
const esquema = Joi.object({
  id: Joi.string().required(),
  titulo: Joi.string().min(1).required(),
  gravedad: Joi.string().valid('alta', 'media', 'baja').required(),
});

export function validar(req, res, next) {
  // abortEarly en false junta todos los fallos en un solo mensaje.
  // convert en false no transforma el cuerpo: una gravedad desconocida
  // sigue siendo desconocida, y un número no aparece donde pedías texto.
  const { error, value } = esquema.validate(req.body, { abortEarly: false, convert: false });
  if (error) {
    // El 400 viaja dentro del error. El middleware de server.mjs lo
    // convierte en la respuesta. Sin esa propiedad saldría un 500.
    next(Object.assign(new Error(error.message), { status: 400 }));
    return;
  }
  req.body = value;
  next();
}