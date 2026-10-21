async function reenviar(res, url) {
  // El gateway no inventa el JSON: copia el status y el cuerpo
  // de la respuesta que le dio el servicio de dentro.
  const respuesta = await fetch(url);
  res.status(respuesta.status).json(await respuesta.json());
}

export function montar(app) {
  // El cliente llama al 8080. `agenda` es el nombre en la red de Compose,
  // donde corre este proceso. En tu terminal ese nombre no existe.
  app.get('/api/agenda/hoy', async (req, res) => {
    await reenviar(res, 'http://agenda:3001/hoy');
  });

  // Mismo reenvío, otro servicio. `tiempo` escucha el 3002 dentro de Compose
  // y no publica ese puerto en el host.
  app.get('/api/tiempo/manana', async (req, res) => {
    await reenviar(res, 'http://tiempo:3002/manana');
  });

  // Ejercicio.
  app.get('/api/citas/hoy', async (req, res) => {
    await reenviar(res, 'http://agenda:3001/hoy');
  });

}
