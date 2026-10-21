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
