# WebSockets

[← gRPC](03-grpc.md) · [Siguiente página →](05-consul.md)

HTTP cierra la respuesta y se acaba la conversación. Un WebSocket deja el canal abierto. El servidor puede escribir cuando hay algo que decir, sin esperar un GET nuevo. El cliente también escribe por el mismo canal.

En el ejemplo la sala se llama `general` y escucha en el puerto 3003. Al conectar, el servidor manda `hola`. Cuando el cliente manda un texto, el servidor lo devuelve con `eco: true`.

Ese empujón no se guarda. Si nadie está conectado, el mensaje no espera en ningún sitio. Un hecho que tiene que sobrevivir aunque el otro proceso esté parado va a la cola. El socket sirve para quien sigue ahí: un tablero, un estado que cambia delante del cliente.

## Ejemplo

La demostración está en [WebSocket](../../ejemplos/03-websockets/README.md). El cliente imprime dos líneas: el saludo de la sala y el eco de `buenos dias`.

No hay laboratorio. Se arranca el canal y se para el cliente para ver que el empujón no queda encolado.
