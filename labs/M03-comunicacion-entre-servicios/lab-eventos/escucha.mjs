// Se registra en el bus que le pasan, el del emisor. Tiene que ocurrir
// antes del emit: si el aviso ya salió, este on no lo recupera.
export function escuchar(bus) {
  bus.on('sensor', (aviso) => {
    console.log('Nombre de sala:', aviso.sala);
  });

  // Segundo oyente del mismo objeto y del mismo nombre. Los dos corren
  // en este proceso, uno detrás de otro, cuando llega `sensor`.
  bus.on('sensor', (aviso) => {
      console.log('registro', aviso.sala);
  });

  // Segundo oyente del mismo objeto y del mismo nombre. Los dos corren
  // en este proceso, uno detrás de otro, cuando llega `sensor`.
  bus.on('puerta', (aviso) => {
      console.log('puerta', aviso.nombre);
  });
}