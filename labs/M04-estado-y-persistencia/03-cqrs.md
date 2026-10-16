# Consistencia eventual y CQRS

[← Redis](02-redis.md) · [Siguiente página →](../M05-seguridad-y-autenticacion/00-jwt.md)

Escribir y leer pueden no ser el mismo sitio. El comando guarda el hecho en PostgreSQL y responde 201 en cuanto la fila existe. La consulta lee otra copia, en Redis. Esa copia se escribe 1,5 segundos después. En ese hueco la fila ya está y el GET responde 404 `aun no proyectado`.

Eso es consistencia eventual: el sistema no promete que la lectura vea la escritura al instante. Promete que, pasado el plazo, la copia alcanza a la fila. El `select` en PostgreSQL enseña la fila desde el primer POST. El 404 no es un fallo del alta. Es el plazo de la proyección.

La replicación, en este curso, se ve como esa copia. Un replica set de Mongo o un standby de PostgreSQL hacen el mismo papel con otro motor: hay un sitio que acepta la escritura y otro que la recibe un poco después. Aquí el sitio de lectura es Redis y el retraso está escrito en el código, para poder ver el 404.

CQRS separa el modelo de comando del modelo de consulta. El comando es la fila `C-1` con plato `sopa`. La consulta es la clave `comanda:C-1`. Quien lee no abre la tabla.

La caché de la página anterior también es una copia, con otra pregunta: evitar un viaje a Mongo cuando el dato no ha cambiado. Aquí la copia es el único sitio por el que se lee, y durante un rato todavía no está.

## Ejemplo

La demostración está en [CQRS](../../ejemplos/04-cqrs/README.md). El POST responde 201. El GET inmediato responde 404. Dos segundos después el GET responde 200 con `sopa`. El `select` muestra la fila desde el principio.

## Laboratorio

[Turnos](lab-cqrs/README.md). El POST ya guarda el turno `T-1` en la mesa `4` y responde 201. El GET sigue leyendo esa tabla. Redis está conectado y no se usa. El plazo de 1,5 segundos y la clave `turno:T-1` se añaden para que el GET deje de leer PostgreSQL y, en el hueco, responda 404 `aun no proyectado`.
