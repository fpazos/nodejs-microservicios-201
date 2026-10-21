export function montar(app, validar, incidencias) {



function apiKey(req, res, next) {
    if (req.header('x-api-key') !== 'lab-incidencias') {
        res.status(401).json({ error: 'falta la clave' });
        return;
    }
    next();
}


  app.post('/incidencias',apiKey, validar, (req, res) => {
    // El id identifica la incidencia. Si ya está en la lista no se pisa:
    // se responde 409 y la lista se queda como estaba.
    if (incidencias.some((item) => item.id === req.body.id)) {
      res.status(409).json({ error: 'id ya existe' });
      return;
    }
    incidencias.push(req.body);
    res.status(201).json(req.body);
  });


  // Leer no lleva clave ni cuerpo. Si el id no está, el fallo es 404:
  // no hay recurso, el cliente no mandó un cuerpo mal formado.
  app.get('/incidencias/:id', (req, res) => {
    const item = incidencias.find((incidencia) => incidencia.id === req.params.id);
    if (!item) {
      res.status(404).json({ error: 'no encontrada' });
      return;
    }
    res.json(item);
  });

  // La misma clave y el mismo esquema que el alta. El id de la URL elige
  // la incidencia; del cuerpo se copian titulo y gravedad.
  app.put('/incidencias/:id', apiKey, validar, (req, res) => {
    const item = incidencias.find((incidencia) => incidencia.id === req.params.id);
    if (!item) {
      res.status(404).json({ error: 'no encontrada' });
      return;
    }
    item.titulo = req.body.titulo;
    item.gravedad = req.body.gravedad;
    res.json(item);
  });



}