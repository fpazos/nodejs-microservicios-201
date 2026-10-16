# Redis como caché

El primer GET de `F-1` lee MongoDB y guarda la clave `ficha:F-1` 60 segundos. El segundo GET lee Redis. Con Mongo parado, la clave sigue respondiendo.

## Cómo ejecutarlo

Si el puerto 27017 lo usa el ejemplo de libros, para ese contenedor antes (`docker rm -f ms-mongo-libros`) o lanza `scripts/limpiar-entorno.sh`.

```bash
cd ejemplos/04-redis-cache
docker compose up -d
until docker exec ms-mongo-fichas mongosh --quiet --eval 'db.runCommand({ ping: 1 }).ok'; do sleep 2; done
npm install
npm run semilla
npm start
```

```bash
curl -s http://127.0.0.1:3001/fichas/F-1; echo
curl -s http://127.0.0.1:3001/fichas/F-1; echo
docker stop ms-mongo-fichas
curl -s http://127.0.0.1:3001/fichas/F-1; echo
```

## Qué se ve

En el servidor: `mongo ficha:F-1` y después `redis ficha:F-1`. El tercer curl, con Mongo parado, sigue devolviendo la ficha y otra línea `redis`.
