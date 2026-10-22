export async function leer(Pelicula, redis, id) {
  // El nombre de la copia lleva el id, para que p1 no pise a otra película.
  // EX 60 hace que caduque: un título viejo no se sirve para siempre.
  const clave = `pelicula:${id}`;
    // La copia se mira antes que Mongo. Si está, la función termina aquí
  // y el findOne de debajo no se ejecuta.
  const cacheado = await redis.get(clave);
  if (cacheado) {
    console.log('redis', id);
    return JSON.parse(cacheado);
  }

  const doc = await Pelicula.findOne({ id }).lean();
  if (!doc) return null;
  console.log('mongo', id);
  await redis.set(clave, JSON.stringify(doc), 'EX', 60);
  return doc;
}
