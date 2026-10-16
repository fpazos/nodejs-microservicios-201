# MongoDB y Mongoose

[← Gateway](../M03-comunicacion-entre-servicios/06-gateway.md) · [Siguiente página →](01-sequelize.md)

El dato de un servicio tiene que seguir ahí cuando el proceso que lo escribió ya terminó. MongoDB lo guarda como documento, y Mongoose es quien describe en el código qué campos tiene ese documento y de qué tipo son. El ejemplo escribe un libro y el proceso de alta termina. Otro proceso, que no tiene el objeto en memoria, lo vuelve a leer: el isbn es `978-1`, el título `El mapa` y la base se llama `libros`. Un documento encaja cuando el recurso se lee y se escribe entero y los campos pueden variar de un registro a otro. La página siguiente es el otro extremo, una fila con columnas fijas.

Redis, más adelante, no sustituye a esta base. Puede guardar una copia caliente. Si se vacía, el libro sigue estando en Mongo.

## Ejemplo

La demostración está en [MongoDB y Mongoose](../../ejemplos/04-mongoose/README.md). `alta` inserta. `lectura` imprime el mismo isbn y el mismo título, y no inserta.

No hay laboratorio de Mongoose. El de caché, más adelante, lee Mongo y es donde se practica dejar de pegar a la base en cada GET.
