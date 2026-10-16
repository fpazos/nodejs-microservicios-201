// El mismo objeto `pieza` se sirve por dos contratos en un proceso:
// GetPieza en el 50051 y GET /piezas/:codigo en el 3001. Un código que
// no coincide es NOT_FOUND en gRPC y 404 en HTTP. Mira que el dato no cambia.
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import express from 'express';

const def = protoLoader.loadSync('./pieza.proto', { keepCase: true, longs: String, defaults: true });
const proto = grpc.loadPackageDefinition(def).inventario;
const pieza = { codigo: 'PZ-1', nombre: 'tornillo', stock: 40 };

const grpcServer = new grpc.Server();
grpcServer.addService(proto.Inventario.service, {
  GetPieza: (call, callback) => {
    if (call.request.codigo !== pieza.codigo) {
      callback({ code: grpc.status.NOT_FOUND, message: 'pieza no encontrada' });
      return;
    }
    callback(null, pieza);
  },
});

// Sin TLS, igual que el cliente. 0.0.0.0 para aceptar la conexión en esa interfaz.
await new Promise((resolve, reject) => {
  grpcServer.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), (err) => {
    if (err) reject(err);
    else resolve();
  });
});
console.log('grpc en 50051');

const app = express();
app.get('/piezas/:codigo', (req, res) => {
  if (req.params.codigo !== pieza.codigo) {
    res.status(404).json({ error: 'pieza no encontrada' });
    return;
  }
  res.json(pieza);
});
app.listen(3001, () => console.log('rest en 3001'));
