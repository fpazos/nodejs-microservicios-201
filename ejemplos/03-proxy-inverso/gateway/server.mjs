// Dos entradas al mismo informe en el mismo proceso. /a-mano es el gateway
// de la página 06: espera la respuesta entera y luego la manda. /proxy es un
// proxy inverso: pasa cada trozo al cliente según llega. Mira dónde se
// espera (await respuesta.text()) y dónde no se espera nada.
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();

// Almacenar y reenviar. El cliente no recibe ni un byte hasta que el
// informe ha terminado, y después aún tiene que descargarlo entero.
app.get('/a-mano/informe', async (req, res) => {
  const respuesta = await fetch('http://informe:3001/informe');
  const texto = await respuesta.text();
  res.status(respuesta.status).type('text/plain').send(texto);
});

// Todo lo que empieza por /proxy va a informe, sin el prefijo y con
// cualquier método. La respuesta se encadena (pipe) al cliente: las dos
// transferencias ocurren a la vez.
app.use('/proxy', createProxyMiddleware({ target: 'http://informe:3001' }));

app.listen(8080, '0.0.0.0', () => console.log('gateway en 8080'));
