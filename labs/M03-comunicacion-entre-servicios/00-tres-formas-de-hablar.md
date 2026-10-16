# Tres formas de hablar

[← Página anterior](README.md) · [Siguiente página →](01-lab-event-emitter.md)

`pedidos` acaba de aceptar `PED-1001` para el SKU `NX-1`. En Nexo ese hecho tiene que llegar a `notificaciones`, el stock hay que preguntarlo a `catalogo`, y la pantalla del cliente tiene que ver el cambio de estado sin recargar.

## Punto de partida

- Terminal con Node.js 22.
- No hace falta ningún broker para este recorrido: es el mapa. Los procesos se levantan en las páginas de laboratorio.

```bash
mkdir -p ~/nexo/m03-demo && cd ~/nexo/m03-demo
```

## Recorrido

1. El mismo hecho, `{ "id": "PED-1001", "sku": "NX-1" }`, puede quedarse dentro del proceso. `EventEmitter` llama a quien se haya suscrito a `pedido:creado` en ese objeto. `notificaciones` y `pedidos` serían dos funciones del mismo `node`. Si ese proceso se reinicia a mitad del `emit`, no hay buzón: nadie más lo oye.

2. Cuando `notificaciones` es otro proceso, el hecho se publica en una cola. RabbitMQ lo guarda en la cola `pedidos.creados` hasta que un consumidor hace el ack. Kafka lo guarda en el topic `pedidos.creados` y el grupo `notificaciones` avanza el offset. Los dos son buzones. Cambian el nombre del sitio donde queda el mensaje y la forma de recordar por dónde se iba leyendo.

3. Preguntar el stock no es un hecho: `pedidos` no puede seguir sin la respuesta. Un GET `http://catalogo:3001/productos/NX-1` devuelve JSON. Un RPC `GetProducto` definido en un `.proto` devuelve el mismo nombre y el mismo stock, en un canal HTTP/2. REST deja el contrato en la URL y el verbo. gRPC lo deja en el fichero `.proto` que comparten los dos servicios. Para una pregunta interna y frecuente, gRPC evita redefinir el JSON en cada cliente.

4. El estado `en-reparto` no lo pide la pantalla: se lo empujan. Un WebSocket queda abierto en el puerto 3003. Cuando el pedido cambia, el servidor escribe un mensaje en ese socket. Un GET repetido también lo vería, un instante después y a base de preguntar.

5. En Nexo conviven los cuatro. El EventEmitter solo sirve de escalón para ver el límite del proceso. La cola cruza servicios. gRPC (o REST) resuelve la pregunta. El WebSocket mantiene la pantalla.

## Qué queda visto

El criterio de elección: si puede esperar y no se puede perder, es cola; si hace falta la respuesta ahora, es llamada; si la pantalla sigue abierta, es socket. Cada mecanismo se construye solo en su laboratorio, empezando por [01 — EventEmitter](01-lab-event-emitter.md).
