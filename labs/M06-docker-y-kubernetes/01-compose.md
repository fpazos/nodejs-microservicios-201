# Docker Compose

[← Dockerfile](00-dockerfile.md) · [Siguiente página →](02-kubernetes.md)

Compose crea una red y le pone nombre a cada servicio. `visitas` no busca Redis en `127.0.0.1`. Usa `redis://redis:6379`. Ese nombre `redis` solo existe dentro de la red. Desde el host no resuelve, y el puerto 6379 no está publicado: el contador solo lo ve el servicio `visitas`.

Cada `GET /visitas` suma uno. El segundo `curl` devuelve 2 porque el número está en Redis, no en la memoria del proceso. Si el contenedor de `visitas` se recrea y Redis sigue, el contador continúa.

Los Compose de los módulos anteriores hacían este papel sin pararse a nombrarlo. Aquí el tema es ese nombre y esa red.

## Ejemplo

La demostración está en [Compose](../../ejemplos/06-compose/README.md). Dos `curl` seguidos devuelven 1 y 2.

No hay laboratorio de Compose. Se usa en los laboratorios anteriores como herramienta ya dada, y se vuelve a usar en el de métricas.
