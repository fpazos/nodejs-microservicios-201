# Laboratorio: la segunda lectura no toca Mongo

El ejemplo de caché ya distingue `mongo` y `redis` con fichas. Aquí cada GET de `p1` escribe `mongo` en el log. Redis está levantado y el cliente creado; no se usa.

### Objetivo

El primer GET loguea `mongo`. El segundo loguea `redis`. Con Mongo parado, el GET sigue devolviendo `El faro`.

### Punto de partida

```bash
bash scripts/limpiar-entorno.sh
cd labs/M04-estado-y-persistencia/lab-cache
docker compose up -d
until docker exec ms-lab-mongo mongosh --quiet --eval 'db.runCommand({ ping: 1 }).ok'; do sleep 2; done
npm install
npm run semilla
npm start
```

```bash
curl -s http://127.0.0.1:3001/peliculas/p1; echo
curl -s http://127.0.0.1:3001/peliculas/p1; echo
```

Las dos respuestas son `El faro`. El log dice `mongo p1` dos veces.

### 1 — Lee la clave antes que Mongo

**Acción:** al principio del handler, antes de `findOne`:

```js
const clave = `pelicula:${req.params.id}`;
const cacheado = await redis.get(clave);
if (cacheado) {
  console.log('redis', req.params.id);
  res.json(JSON.parse(cacheado));
  return;
}
```

Reinicia `npm start` y repite los dos `curl`. El primero sigue diciendo `mongo`: la clave aún no existe. El segundo también, porque todavía no guardas.

**Por qué:** sin este `return`, Redis no ahorra la lectura aunque la clave exista.

**Resultado esperado:** el servidor arranca. Los dos GET siguen viniendo de Mongo.

### 2 — Guarda al salir de Mongo

**Acción:** justo antes de `res.json(doc)`:

```js
await redis.set(clave, JSON.stringify(doc), 'EX', 60);
```

Reinicia. Borra la clave por si quedó a medias: `docker exec ms-lab-redis redis-cli del pelicula:p1`. Dos `curl`.

**Por qué:** la caducidad de 60 segundos evita servir un título viejo para siempre. Quien actualice la película tiene que borrar la clave; aquí no hay actualización.

**Resultado esperado:** log `mongo p1` y después `redis p1`. Los dos cuerpos traen `El faro`.

### 3 — Para Mongo

**Acción:**

```bash
docker stop ms-lab-mongo
curl -s http://127.0.0.1:3001/peliculas/p1; echo
```

**Por qué:** la respuesta sale de Redis. Si la clave no está y Mongo está parado, el GET ya no puede rellenar la caché.

**Resultado esperado:** el JSON de `p1` y una línea `redis` en el servidor.

## Comprueba tu entendimiento

**La clave caduca**
`docker exec ms-lab-redis redis-cli ttl pelicula:p1`
→ Un entero entre 1 y 60.

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| Los dos GET dicen `mongo` | No guardas la clave, o no reiniciaste | El `set` está antes del `res.json` y el proceso es el nuevo |
| 500 con Mongo parado | La clave no existía | Repite los dos GET del paso 2 antes de `docker stop` |
