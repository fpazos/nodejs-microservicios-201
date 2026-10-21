# Proxy inverso

El concepto está en [Proxy inverso](../../labs/M03-comunicacion-entre-servicios/07-proxy-inverso.md).

## Dónde poner el foco

Un mismo gateway tiene dos entradas al mismo informe. `/a-mano/informe` hace lo mismo que el gateway del ejemplo 03-gateway: espera la respuesta entera de `informe` y solo después se la manda al cliente. `/proxy/informe` es un proxy inverso que pasa cada trozo al cliente según llega. El informe tarda 2 s en generarse y el cliente tarda 2 s en descargarlo. Con el gateway a mano esas dos esperas se suman. Con el proxy se solapan.

## Archivos

| Archivo | Papel |
|---------|-------|
| `informe/server.mjs` | `/informe` escribe 10 trozos de 20 KB, uno cada 200 ms |
| `gateway/server.mjs` | Escucha el 8080. `/a-mano` almacena y reenvía, `/proxy` usa `http-proxy-middleware` |
| `medir.mjs` | Cliente lento (100 KB/s) que mide el primer byte y el total por cada entrada |
| `gateway/package.json` | Dependencias `express` y `http-proxy-middleware` |
| `informe/package.json` | Dependencia `express` |
| `*/Dockerfile` | Una imagen por servicio |
| `docker-compose.yml` | El informe sin puerto publicado y el gateway en el 8080 |

## El código

### `informe/server.mjs`

```js
// El informe no está hecho de antemano: sale en 10 trozos de 20 KB, uno
// cada 200 ms. Generarlo entero cuesta 2 segundos. Mira res.write: cada
// trozo sale por el socket en cuanto existe, sin esperar al siguiente.
import express from 'express';

const TROZOS = 10;
const TAM = 20 * 1024;

const app = express();
app.get('/informe', async (req, res) => {
  res.type('text/plain');
  for (let i = 1; i <= TROZOS; i += 1) {
    res.write(`${String(i).padStart(2, '0')} `.padEnd(TAM - 1, '.') + '\n');
    await new Promise((r) => setTimeout(r, 200));
  }
  res.end();
});
app.listen(3001, '0.0.0.0', () => console.log('informe en 3001'));
```

### `gateway/server.mjs`

```js
// Dos entradas al mismo informe en el mismo proceso. /a-mano es el gateway
// de la página 06: espera la respuesta entera y luego la manda. /proxy es un
// proxy inverso: pasa cada trozo al cliente según llega. Mira dónde se
// espera (await respuesta.text()) y dónde no se espera nada.
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();

// Almacenar y reenviar. El cliente no recibe ni un byte hasta que el
// informe ha terminado, y después aún tiene que descargarlo entero.
app.get('/a-mano/informe', async (req, res) => {
  const respuesta = await fetch('http://informe:3001/informe');
  const texto = await respuesta.text();
  res.status(respuesta.status).type('text/plain').send(texto);
});

// Todo lo que empieza por /proxy va a informe, sin el prefijo y con
// cualquier método. La respuesta se encadena (pipe) al cliente: las dos
// transferencias ocurren a la vez.
app.use('/proxy', createProxyMiddleware({ target: 'http://informe:3001' }));

app.listen(8080, '0.0.0.0', () => console.log('gateway en 8080'));
```

### `medir.mjs`

```js
// Pide el mismo informe por las dos entradas con un cliente lento: tarda
// 1 s por cada 100 KB que lee, como una conexión móvil. Generar el informe
// cuesta 2 s y descargarlo otros 2 s. Mira si esas dos esperas se suman.
const BASE = process.env.BASE || 'http://127.0.0.1:8080';
const BYTES_POR_SEGUNDO = 100 * 1024;

async function medir(camino) {
  const inicio = performance.now();
  const respuesta = await fetch(`${BASE}/${camino}/informe`);
  let primerByte;
  let bytes = 0;
  for await (const trozo of respuesta.body) {
    primerByte ??= performance.now() - inicio;
    bytes += trozo.length;
    // Leer este trozo le cuesta al cliente lo que tardaría su red.
    await new Promise((r) => setTimeout(r, (trozo.length / BYTES_POR_SEGUNDO) * 1000));
  }
  const total = performance.now() - inicio;
  const s = (ms) => (ms / 1000).toFixed(2);
  console.log(`${camino.padEnd(6)}  primer byte ${s(primerByte)} s  total ${s(total)} s  (${bytes} bytes)`);
}

await medir('a-mano');
await medir('proxy');
```

## Qué hacer

En un Codespace, lanza antes `bash scripts/red-docker-codespace.sh` desde la raíz del repo (ver [Entorno](../../infra/README.md#codespace-contenedores-que-no-se-ven)).

```bash
cd ejemplos/03-proxy-inverso
docker compose up --build -d
node medir.mjs
```

## Qué observar

```
a-mano  primer byte 2.19 s  total 4.20 s  (204800 bytes)
proxy   primer byte 0.01 s  total 2.02 s  (204800 bytes)
```

Por `/a-mano`, el cliente no recibe nada durante 2 s: el gateway está dentro de `await respuesta.text()`, reuniendo el informe. Cuando por fin lo manda, al cliente le cuesta otros 2 s leerlo. El total es la suma de los dos tramos, unos 4 s.

Por `/proxy`, el primer trozo llega a los pocos milisegundos. Mientras `informe` escribe el trozo 5, el cliente ya está leyendo el 4. El total es el del tramo más lento, unos 2 s. El proxy no ha añadido una segunda espera.

El servidor y los bytes son los mismos. La diferencia está en si el gateway guarda el cuerpo entero antes de reenviarlo o lo encadena según llega. Con respuestas cortas, como un JSON de 40 bytes, ni se nota. Con una exportación, un fichero o un stream, el gateway a mano dobla el tiempo y además guarda en memoria cada respuesta completa.

## Qué validar

`a-mano` en torno a 2 s de primer byte y 4 s de total, y `proxy` por debajo de 0,1 s de primer byte y en torno a 2 s de total. Los dos con `204800 bytes`. `curl http://127.0.0.1:3001/informe` no conecta, porque el informe solo entra por el 8080.

Para terminar: `docker compose down`.
