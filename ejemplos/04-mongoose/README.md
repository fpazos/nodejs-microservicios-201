# MongoDB y Mongoose

El libro queda en MongoDB. El proceso que lo escribe termina. Otro proceso lo lee.

## Cómo ejecutarlo

```bash
cd ejemplos/04-mongoose
docker compose up -d
until docker exec ms-mongo-libros mongosh --quiet --eval 'db.runCommand({ ping: 1 }).ok'; do sleep 2; done
npm install
npm run alta
npm run lectura
```

## Qué se ve

Las dos órdenes imprimen `isbn` `978-1` y `titulo` `El mapa`. `lectura` no inserta: pregunta.
