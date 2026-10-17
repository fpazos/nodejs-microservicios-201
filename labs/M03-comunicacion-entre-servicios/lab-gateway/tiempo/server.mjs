// El tiempo de mañana, en el 3002 de la red de Compose.
// El host no tiene ese puerto publicado.
import express from 'express';

const app = express();
app.get('/manana', (req, res) => {
  res.json({ estado: 'lluvia' });
});
app.listen(3002, '0.0.0.0', () => console.log('tiempo en 3002'));
