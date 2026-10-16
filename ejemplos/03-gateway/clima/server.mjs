// Este proceso solo conoce /hoy. El prefijo /api/clima lo pone el gateway.
// Escucha en 0.0.0.0 para que ese otro contenedor abra http://clima:3001
// en la red de Compose. Mira el puerto 3001 y la ruta corta.
import express from 'express';

const app = express();
app.get('/hoy', (req, res) => {
  res.json({ ciudad: 'Madrid', estado: 'nubes' });
});
app.listen(3001, '0.0.0.0', () => console.log('clima en 3001'));
