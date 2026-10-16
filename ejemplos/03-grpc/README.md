# gRPC y el GET equivalente

`GetPieza` está definido en `pieza.proto`. El mismo dato sale por gRPC (puerto 50051, sin TLS) y por GET `/piezas/PZ-1`. El contrato de gRPC es el fichero. El de REST es el camino y el JSON.

## Cómo ejecutarlo

```bash
cd ejemplos/03-grpc
npm install
npm run servidor
```

```bash
npm run cliente
curl -s http://127.0.0.1:3001/piezas/PZ-1
echo
curl -s -w '\n%{http_code}\n' http://127.0.0.1:3001/piezas/PZ-9
```

## Qué se ve

El cliente imprime `codigo` `PZ-1`, `nombre` `tornillo`, `stock` 40. El GET devuelve el mismo JSON. `PZ-9` responde 404. En gRPC, cambia el argumento del cliente a `PZ-9` y el mensaje es `pieza no encontrada`.
