import express from 'express';

const app = express();
app.get('/hoy', (req, res) => {
  res.json({ ciudad: 'Madrid', estado: 'nubes' });
});
app.listen(3001, '0.0.0.0', () => console.log('clima en 3001'));
