// La llamada sale del proto cargado, hacia el puerto gRPC. El canal
// queda abierto después de la respuesta: el proceso sale a propósito
// al terminar una consulta. Mira el código PZ-1 y el puerto 50051.
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';

// keepCase deja los nombres como en el proto, alineados con el JSON del GET.
const def = protoLoader.loadSync('./pieza.proto', { keepCase: true, longs: String, defaults: true });
const proto = grpc.loadPackageDefinition(def).inventario;
const cliente = new proto.Inventario('127.0.0.1:50051', grpc.credentials.createInsecure());

cliente.GetPieza({ codigo: 'PZ-1' }, (err, respuesta) => {
  if (err) {
    console.error(err.message);
    process.exit(1);
  }
  console.log(respuesta);
  process.exit(0);
});
