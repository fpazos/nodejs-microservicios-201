# Consul

El concepto está en [Consul](../../labs/M03-comunicacion-entre-servicios/05-consul.md).

## Dónde poner el foco

`reloj` corre con dos réplicas y no publica su puerto en el host. Al arrancar, cada réplica se registra en Consul con el mismo nombre, `reloj`, pero con su propio ID y su propia IP. El cliente pregunta quién está sano con ese nombre, recibe las dos y va llamando a una y a otra.

## Archivos

| Archivo | Papel |
|---------|-------|
| `reloj/server.mjs` | Sirve `/hora` y `/salud`, y se registra con su ID, su IP y un check HTTP |
| `cliente/cliente.mjs` | Pregunta el servicio `reloj` en passing y pide la hora seis veces, alternando instancias |
| `reloj/package.json` | Dependencia `express` del reloj |
| `cliente/package.json` | Cliente sin dependencias; usa el `fetch` de Node |
| `reloj/Dockerfile` | Imagen del reloj, a la escucha en el 3001 |
| `cliente/Dockerfile` | Imagen del cliente; solo copia `cliente.mjs` |
| `docker-compose.yml` | Consul con la UI, dos réplicas del reloj (`deploy.replicas: 2`) y el cliente |

## El código

### `reloj/server.mjs`

```js
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
```

### `cliente/cliente.mjs`

```js
// El puerto del reloj no está escrito aquí. Cada vuelta pregunta a Consul
// quién está passing y llama a una de las direcciones que devuelve. Con dos
// réplicas, la vuelta i elige la i-ésima de la lista: así se ve que las
// respuestas alternan entre instancias. Mira el query `passing` y el uso
// de Address y Port del catálogo.
const consul = process.env.CONSUL_HTTP_ADDR;

let llamadas = 0;
for (let i = 0; i < 30 && llamadas < 6; i += 1) {
  const respuesta = await fetch(`${consul}/v1/health/service/reloj?passing`);
  const lista = await respuesta.json();
  if (lista.length > 0) {
    const svc = lista[llamadas % lista.length].Service;
    const hora = await fetch(`http://${svc.Address}:${svc.Port}/hora`);
    console.log(`${lista.length} en passing →`, svc.Address, svc.Port, await hora.json());
    llamadas += 1;
  }
  // El registro ocurre después de arrancar los contenedores del reloj.
  await new Promise((r) => setTimeout(r, 1000));
}

if (llamadas === 0) {
  console.error('nadie registrado');
  process.exit(1);
}
```

## Qué hacer

En un Codespace, lanza antes esto desde la raíz del repo. Sin ello el reloj no alcanza a Consul dentro de Compose (ver [Entorno](../../infra/README.md#codespace-contenedores-que-no-se-ven)):

```bash
bash scripts/red-docker-codespace.sh
```

```bash
cd ejemplos/03-consul
docker compose up --build
```

`docker compose up` sin `-d` deja los logs a la vista. El cliente termina solo cuando ha impreso la hora.

La UI de Consul está en http://127.0.0.1:8500. Para repetirlo: `docker compose down` y otra vez `docker compose up --build`.

## Qué observar

Compose arranca `ms-consul-reloj-1` y `ms-consul-reloj-2`. Sus logs (`docker compose logs reloj`) dicen `registrado en consul` después de `reloj en 3001`, cada uno con un ID `reloj-<hostname>` y una IP distintos. Si las dos réplicas se registraran con el mismo ID, la segunda pisaría a la primera y Consul solo vería una. Tampoco sirve la dirección `reloj`, porque Docker la resuelve a cualquiera de las dos y el check no sabría a quién mira.

En los de `ms-reloj-cliente` hay seis líneas. Cuando ya hay dos en passing, la IP y el `id` alternan. Esas direcciones salen del catálogo (`Address` y `Port`), no de una constante del cliente. En la UI, el servicio `reloj` tiene dos instancias en passing, cada una con su check contra `http://<su IP>:3001/salud` cada 5 segundos.

Para quitar una réplica y ver cómo el listín lo nota: `docker stop ms-consul-reloj-2`. Unos segundos después su check está critical y, si relanzas el cliente con `docker compose up cliente`, solo llama a la otra.

## Qué validar

`registrado en consul` en las dos réplicas, y en el cliente líneas con `2 en passing` cuyo `id` alterna entre dos valores `reloj-…`.

Si en cambio un reloj termina con `ConnectTimeoutError (attempted address: consul:8500)`, los contenedores no se ven entre sí. Lanza `bash scripts/red-docker-codespace.sh` desde la raíz y vuelve a `docker compose up --build`. Si editaste `reloj/server.mjs`, el `--build` es lo que mete tu cambio en la imagen.

![reloj descubierto](../img/03-consul.png)
