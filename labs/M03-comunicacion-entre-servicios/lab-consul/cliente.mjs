const consul = process.env.CONSUL_HTTP_ADDR || 'http://127.0.0.1:8500';

// La llamada nombra el puerto 3001. `consul` ya apunta al listín y este
// proceso no le pregunta quién atiende prefijos, por eso el aviso sale
// como directo.
const directo = await fetch('http://127.0.0.1:3001/codigo');
console.log('directo', await directo.json());

void consul;
