import express from 'express';

const app = express();
app.get('/manana', (req, res) => {
  res.json({ estado: 'lluvia' });
});
app.listen(3002, '0.0.0.0', () => console.log('tiempo en 3002'));
