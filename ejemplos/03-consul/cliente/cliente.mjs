const consul = process.env.CONSUL_HTTP_ADDR;

for (let i = 0; i < 20; i += 1) {
  const respuesta = await fetch(`${consul}/v1/health/service/reloj?passing`);
  const lista = await respuesta.json();
  if (lista.length > 0) {
    const svc = lista[0].Service;
    const hora = await fetch(`http://${svc.Address}:${svc.Port}/hora`);
    console.log(svc.Address, svc.Port, await hora.json());
    process.exit(0);
  }
  await new Promise((r) => setTimeout(r, 1000));
}

console.error('nadie registrado');
process.exit(1);
