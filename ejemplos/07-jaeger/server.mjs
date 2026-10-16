// La ruta no crea trazos: los abre la instrumentación cargada antes.
// Cada GET es una petición distinta. Jaeger guarda un trazo por llamada,
// no un contador acumulado.
import express from 'express';

const app = express();
app.get('/piezas/PZ-1', (req, res) => {
  res.json({ codigo: 'PZ-1', nombre: 'tornillo' });
});
app.listen(3001, '0.0.0.0', () => console.log('piezas en 3001'));
