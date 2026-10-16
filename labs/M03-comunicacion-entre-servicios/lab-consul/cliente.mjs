const consul = process.env.CONSUL_HTTP_ADDR || 'http://127.0.0.1:8500';

const directo = await fetch('http://127.0.0.1:3001/codigo');
console.log('directo', await directo.json());

// TODO: deja de usar el puerto escrito a mano.
// GET ${consul}/v1/health/service/prefijos?passing
// llama a http://Service.Address:Service.Port/codigo
// imprime 'descubierto' y el JSON
void consul;
