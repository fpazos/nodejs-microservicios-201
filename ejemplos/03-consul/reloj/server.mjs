// Al escuchar, el reloj se apunta en Consul con el nombre `reloj` y
// un check a /salud. Hay dos réplicas con el mismo nombre de servicio:
// cada una se registra con su propio ID (el hostname del contenedor) y
// con su IP en la red de Compose, porque el nombre `reloj` no distingue
// a una de otra. Mira ID, Address, Port y el check.
import os from 'node:os';
import express from 'express';

const consul = process.env.CONSUL_HTTP_ADDR;
const instancia = `reloj-${os.hostname()}`;
const ip = Object.values(os.networkInterfaces())
  .flat()
  .find((i) => i.family === 'IPv4' && !i.internal).address;

const app = express();
app.get('/salud', (req, res) => {
  res.json({ ok: true });
});
app.get('/hora', (req, res) => {
  res.json({ hora: new Date().toISOString(), id: instancia });
});

async function registrar() {
  console.log('registrando en consul')
  const respuesta = await fetch(`${consul}/v1/agent/service/register`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      Name: 'reloj',
      ID: instancia,
      Address: ip,
      Port: 3001,
      Check: { HTTP: `http://${ip}:3001/salud`, Interval: '5s' },
    }),
  });
  if (!respuesta.ok) throw new Error(`registro ${respuesta.status}`);
  console.log('registrado en consul', instancia, ip);
}

// 0.0.0.0: otro contenedor de la red tiene que poder abrir el 3001.
// El bucle existe porque Consul puede no aceptar el registro al primer intento.
app.listen(3001, '0.0.0.0', async () => {
  console.log('reloj en 3001');
  for (let i = 0; i < 15; i += 1) {
    try {
      await registrar();
      return;
    } catch (err) {
      if (i === 14) throw err;
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
});
