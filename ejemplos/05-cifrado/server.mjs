import https from 'node:https';
import { readFileSync } from 'node:fs';
import express from 'express';

const app = express();
app.get('/salud', (req, res) => {
  res.json({ ok: true });
});

https.createServer({
  key: readFileSync('key.pem'),
  cert: readFileSync('cert.pem'),
}, app).listen(3443, () => console.log('tls en 3443'));
