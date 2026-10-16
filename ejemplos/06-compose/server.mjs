// REDIS_URL nombra al servicio `redis` de Compose, no a una IP. El
// fallback 127.0.0.1 es para un Redis en el host; dentro de la red de
// Compose ese loopback sería el propio contenedor y no vería a Redis.
import express from 'express';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');
const app = express();

app.get('/visitas', async (req, res) => {
  const n = await redis.incr('visitas');
  res.json({ visitas: n });
});

app.listen(3001, '0.0.0.0', () => console.log('visitas en 3001'));
