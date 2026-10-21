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
