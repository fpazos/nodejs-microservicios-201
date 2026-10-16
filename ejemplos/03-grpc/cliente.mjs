import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';

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
