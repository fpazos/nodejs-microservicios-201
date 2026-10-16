// El cliente entra por el 8080. Cada ruta pública nombra un servicio de
// la red de Compose; el 3001 y el 3002 no se publican en el host. Mira
// los hostnames `clima` y `cotizaciones`, y que el estado se copia tal cual.
import express from 'express';

const app = express();

async function reenviar(res, url) {
  const respuesta = await fetch(url);
  const texto = await respuesta.text();
  // Se reenvían estado y cuerpo. El gateway no vuelve a interpretar el JSON.
  res.status(respuesta.status).type('application/json').send(texto);
}

app.get('/api/clima/hoy', async (req, res) => {
  await reenviar(res, 'http://clima:3001/hoy');
});

app.get('/api/cotizaciones/usd', async (req, res) => {
  await reenviar(res, 'http://cotizaciones:3002/usd');
});

app.listen(8080, '0.0.0.0', () => console.log('gateway en 8080'));
