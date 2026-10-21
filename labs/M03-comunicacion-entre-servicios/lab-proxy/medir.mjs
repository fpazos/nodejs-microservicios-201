// Cliente lento: lee a 100 KB/s, como una conexión móvil. Imprime cuándo
// llegó el primer byte y cuándo terminó. Uso: node medir.mjs /api/facturas/csv
const camino = process.argv[2] || '/api/facturas/csv';
const BYTES_POR_SEGUNDO = 100 * 1024;

const inicio = performance.now();
const respuesta = await fetch(`http://127.0.0.1:8080${camino}`);
let primerByte;
let bytes = 0;
for await (const trozo of respuesta.body) {
  primerByte ??= performance.now() - inicio;
  bytes += trozo.length;
  // Leer este trozo le cuesta al cliente lo que tardaría su red.
  await new Promise((r) => setTimeout(r, (trozo.length / BYTES_POR_SEGUNDO) * 1000));
}
const s = (ms) => ((ms ?? 0) / 1000).toFixed(2);
console.log(`${respuesta.status} ${camino}  primer byte ${s(primerByte)} s  total ${s(performance.now() - inicio)} s  (${bytes} bytes)`);
