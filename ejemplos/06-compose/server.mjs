import express from 'express';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');
const app = express();

app.get('/visitas', async (req, res) => {
  const n = await redis.incr('visitas');
  res.json({ visitas: n });
});

app.listen(3001, '0.0.0.0', () => console.log('visitas en 3001'));
