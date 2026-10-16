# EventEmitter

[← Middleware](../M02-apis-rest-express/02-middleware.md) · [Siguiente página →](01-rabbitmq.md)

`EventEmitter` es un objeto en memoria del proceso. Alguien hace `emit` con un nombre y un dato, y quien hizo `on` con ese nombre sobre el mismo objeto recibe el dato. El nombre no viaja a ningún sitio: otro proceso puede escuchar `alarma` y no se entera, porque su `EventEmitter` es otro objeto. Sirve para que un módulo avise a otro del mismo servicio sin llamarse entre sí. En cuanto hay dos procesos, el aviso necesita un sitio fuera de los dos, y eso es la cola.

## Qué se mira

| Programa | Qué comparte | Qué imprime |
|----------|--------------|-------------|
| `mismo-proceso.mjs` | Un solo `bus` | `oyente hall` |
| `otro-proceso.mjs` | Nada con el anterior | Silencio, aunque el otro emita `alarma` |

El dato del ejemplo es `{ zona: 'hall' }`. El nombre del evento es `alarma`. Ese nombre no es una cola.

## Ejemplo

La demostración está en [EventEmitter](../../ejemplos/03-event-emitter/README.md). Primero el mismo proceso. Después el oyente en un proceso y el emisor en otro: la terminal del oyente sigue en blanco.

## Laboratorio

[Eventos](lab-eventos/README.md). El emisor ya lanza `sensor` con `{ sala: 'lab' }` y nadie escucha. El oyente es otro proceso. Se añade el `on` en el mismo proceso y se comprueba que el otro proceso sigue en silencio.
