# Dockerfile

[← Cifrado](../M05-seguridad-y-autenticacion/02-cifrado-y-tls.md) · [Siguiente página →](01-compose.md)

Hasta este módulo, Compose levantaba brokers y bases y el Dockerfile no se abría. Aquí se ve qué hay dentro de la imagen de un servicio Node.

La imagen parte de Node 22. Copia el `package.json`, instala, copia el servidor y arranca como usuario `node`, no como root. El proceso escucha en `0.0.0.0`. Si escuchara en `127.0.0.1`, el puerto publicado en el host no le entregaría tráfico: dentro del contenedor, localhost es el propio contenedor.

La imagen se llama `ms-hola:lab`. El contenedor se llama `ms-hola` y publica el 3001. `GET /hola` responde el mensaje y el nombre del host, que es el id del contenedor.

## Ejemplo

La demostración está en [Dockerfile](../../ejemplos/06-dockerfile/README.md). El `curl` devuelve `hola`. `docker exec ms-hola ps` muestra `node server.mjs`.

No hay laboratorio de imagen. El de kind, más adelante, construye otra imagen y la carga en el clúster.
