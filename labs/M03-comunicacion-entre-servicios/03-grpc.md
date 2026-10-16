# gRPC y REST

[← Kafka](02-kafka.md) · [Siguiente página →](04-websockets.md)

Las dos formas preguntan y esperan la respuesta. Cambian el contrato.

En REST el contrato es el verbo, el camino y el JSON. `GET /piezas/PZ-1` devuelve `codigo`, `nombre` y `stock`. Un código que no está es un 404.

En gRPC el contrato es `pieza.proto`. El paquete se llama `inventario` y el método `GetPieza`. El cliente y el servidor comparten ese fichero. El puerto del ejemplo es 50051, sin TLS. Si el código no está, el estado es `NOT_FOUND` y el mensaje es `pieza no encontrada`.

El dato es el mismo: `PZ-1`, tornillo, stock 40. Ver los dos lados a la vez evita tratar gRPC como «otro HTTP». El binario y el fichero `.proto` son el contrato; el JSON y la URL son el otro.

Node lo monta con `@grpc/grpc-js` y `@grpc/proto-loader`. El loader lee el `.proto` en arranque. No hay un compilador aparte en este ejemplo.

## Ejemplo

La demostración está en [gRPC y el GET](../../ejemplos/03-grpc/README.md). El cliente gRPC imprime la pieza. El `curl` al 3001 imprime el mismo JSON. `PZ-9` es 404 por HTTP y `pieza no encontrada` por gRPC.

No hay laboratorio de gRPC. Se arranca y se contrastan las dos respuestas.
