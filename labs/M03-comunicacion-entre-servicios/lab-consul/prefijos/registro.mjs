export async function registrar(consul) {
  // El PUT anuncia el servicio en el agente. Address y Port son los que
  // ve tu terminal, en el host. El check llega por el puerto publicado
  // porque en este entorno los contenedores no se alcanzan entre sí.
  const respuesta = await fetch(`${consul}/v1/agent/service/register`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      Name: 'prefijos',
      ID: 'prefijos-1',
      Address: '127.0.0.1',
      Port: 3001,
      Check: { HTTP: 'http://host.docker.internal:3001/salud', Interval: '5s' },
    }),
  });
  // Si el agente rechaza el registro, el proceso no sigue en silencio.
  if (!respuesta.ok) throw new Error(`registro ${respuesta.status}`);
  console.log('registrado');
}
