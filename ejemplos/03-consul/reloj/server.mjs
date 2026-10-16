// Al escuchar, el reloj se apunta en Consul con el nombre `reloj` y
// un check a /salud. La dirección es el nombre del servicio en Compose,
// porque el cliente corre en otro contenedor. Mira Address, Port y el check.
import express from 'express';

const consul = process.env.CONSUL_HTTP_ADDR;

const app = express();
app.get('/salud', (req, res) => {
  res.json({ ok: true });
});
app.get('/hora', (req, res) => {
  res.json({ hora: new Date().toISOString(), id: 'reloj-1' });
});

async function registrar() {
  const respuesta = await fetch(`${consul}/v1/agent/service/register`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      Name: 'reloj',
      ID: 'reloj-1',
      Address: 'reloj',
      Port: 3001,
      Check: { HTTP: 'http://reloj:3001/salud', Interval: '5s' },
    }),
  });
  if (!respuesta.ok) throw new Error(`registro ${respuesta.status}`);
  console.log('registrado en consul');
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
