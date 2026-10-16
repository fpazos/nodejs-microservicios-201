# Redis como caché

[← Sequelize](01-sequelize.md) · [Siguiente página →](03-cqrs.md)

Redis guarda la copia que se va a volver a pedir. La ficha `F-1` vive en MongoDB. El primer GET no la encuentra en Redis, la lee de Mongo, y la guarda con la clave `ficha:F-1` y caducidad de 60 segundos. El segundo GET lee Redis. En el log se ve `mongo` y después `redis`.

Parar Mongo no borra la clave. El tercer GET sigue respondiendo la ficha mientras no caduque. Esa respuesta sale de la copia. Cuando expire, o cuando Redis se vacíe, la fuente vuelve a ser Mongo. Por eso Redis, en este uso, no es de donde se recupera el dato si se pierde la memoria.

La clave lleva prefijo y caducidad a propósito. Sin caducidad, un cambio en Mongo puede quedar invisible. Sin prefijo, las claves de otro uso se pisan.

## Ejemplo

La demostración está en [Redis como caché](../../ejemplos/04-redis-cache/README.md). Dos GET seguidos, luego `docker stop` del Mongo de fichas, y un tercer GET que sigue devolviendo la ficha con otra línea `redis`.

## Laboratorio

[Películas](lab-cache/README.md). La semilla deja la película `p1`, «El faro», en Mongo. El servidor la lee siempre de Mongo y escribe `mongo` en el log. El cliente de Redis ya está conectado y no se usa. La clave del laboratorio es `pelicula:p1`, con la misma caducidad de 60 segundos.
