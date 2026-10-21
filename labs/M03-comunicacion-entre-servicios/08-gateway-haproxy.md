# Gateway con HAProxy

[← Proxy inverso](07-proxy-inverso.md) · [Siguiente página →](../M04-estado-y-persistencia/00-mongoose.md)

El cliente entra por un solo puerto. HAProxy es el proceso que lo escucha. Lee `haproxy.cfg`: el frontend acepta la petición, una ACL mira el prefijo del camino y el backend nombra los procesos que pueden responder.

| Camino de fuera | Backend | Qué responde |
|-----------------|---------|--------------|
| `GET /api/mostrador/turno` en el 8080 | `mostrador-a` y `mostrador-b`, por turnos | `{"mostrador":"a"}` y, en la siguiente, `{"mostrador":"b"}` |
| `GET /api/avisos/hoy` en el 8080 | `avisos` | `{"texto":"cierra a las 21"}` |

Los dos mostradores escuchan el 3001 dentro de su contenedor. `avisos` escucha el 3002. Esos puertos no están publicados en el host. HAProxy los alcanza por el nombre del servicio en la red de Compose.

El servicio responde la ruta corta. `mostrador` conoce `/turno`. La línea `set-path` del backend quita `/api/mostrador` después de que la ACL ha elegido ese backend, así la ACL sigue viendo el prefijo.

Cada servidor tiene un check a `/salud`. Si un mostrador deja de aceptar conexiones, HAProxy lo marca DOWN y las peticiones de `/api/mostrador/turno` se quedan en el otro. La URL del cliente no cambia.

`/salud` en el 8080 lo responde el propio HAProxy. No pasa por ningún servicio. La página `/stats` dice qué servidor está UP.

El gateway Express escribe cada camino en un `app.get` y llama con `fetch`. Aquí el camino está en el fichero, y un mismo camino puede tener dos procesos.

## Ejemplo

La demostración está en [HAProxy](../../ejemplos/03-haproxy/README.md). Dos `curl` seguidos a `/api/mostrador/turno` devuelven `a` y `b`. `/api/avisos/hoy` devuelve el texto. El `curl` a `http://127.0.0.1:3001/turno` no conecta.

## Laboratorio

[Caja y almacén](lab-haproxy/README.md). Las dos cajas y el almacén ya responden. HAProxy escucha en el 8080 y su fichero todavía no tiene backends: `/salud` dice `Service ready.` y `/api/caja/abierta` responde 503. Las ACL y los backend se añaden en `haproxy.cfg`, que el Compose monta. `docker kill --signal USR2 ms-lab-haproxy` vuelve a leer el fichero. Los nombres de dentro son `caja-1`, `caja-2` y `almacen`.
