const consul = process.env.CONSUL_HTTP_ADDR || 'http://127.0.0.1:8500';

// passing filtra instancias cuyo check responde bien. El cliente ya no
// nombra el 3001: se queda con Address y Port del primer servicio de la lista.
const listaRes = await fetch(`${consul}/v1/health/service/prefijos?passing`);
const lista = await listaRes.json();
if (lista.length === 0) {
  console.error('nadie en passing');
  process.exit(1);
}
const svc = lista[0].Service;
//console.log('en passing', svc.Address, svc.Port);

// Address y Port salieron del listín. Si el servicio se moviera de puerto,
// cambiaría el registro, no esta URL.
const respuesta = await fetch(`http://${svc.Address}:${svc.Port}/codigo`);
console.log('descubierto', svc.Address, svc.Port, await respuesta.json());

// Checks viaja en cada entrada del health. El estado del primero dice si /salud respondió.
console.log('check', lista[0].Checks[0].Status);