# EventEmitter

[← Middleware](../M02-apis-rest-express/02-middleware.md) · [Siguiente página →](01-rabbitmq.md)

`EventEmitter` es un objeto en memoria. Alguien hace `emit` con un nombre y un dato. Quien hizo `on` con ese nombre, sobre el mismo objeto, recibe el dato. El nombre no sale del proceso. Otro `node` puede escuchar `alarma` y no se entera: su `EventEmitter` es otro objeto.

Sirve para avisar dentro del servicio: un módulo emite, otro del mismo proceso reacciona, sin que se llamen entre sí. No sirve para avisar a otro microservicio. En cuanto hay dos procesos, el aviso necesita un sitio fuera de los dos, y eso es la cola.

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
