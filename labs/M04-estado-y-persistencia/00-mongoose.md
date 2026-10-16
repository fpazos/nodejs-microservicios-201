# MongoDB y Mongoose

[← Gateway](../M03-comunicacion-entre-servicios/06-gateway.md) · [Siguiente página →](01-sequelize.md)

El dato de un servicio tiene que seguir cuando el proceso que lo escribió ya terminó. MongoDB guarda documentos. Mongoose describe la forma de ese documento en el código: qué campos tiene el libro y de qué tipo son.

El ejemplo escribe un libro y el proceso de alta termina. Otro proceso, que no tiene el objeto en memoria, lo vuelve a leer. El isbn es `978-1` y el título `El mapa`. La base se llama `libros`.

Un documento encaja cuando el recurso se lee y se escribe entero, y los campos pueden variar de un registro a otro. La fila de la página siguiente es el otro extremo: columnas fijas y una tabla.

Redis, más adelante, no sustituye a esta base. Puede guardar una copia caliente. Si se vacía, el libro sigue estando en Mongo.

## Ejemplo

La demostración está en [MongoDB y Mongoose](../../ejemplos/04-mongoose/README.md). `alta` inserta. `lectura` imprime el mismo isbn y el mismo título, y no inserta.

No hay laboratorio de Mongoose. El de caché, más adelante, lee Mongo y es donde se practica dejar de pegar a la base en cada GET.
