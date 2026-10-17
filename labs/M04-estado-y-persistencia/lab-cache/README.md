# Laboratorio: la segunda lectura no toca Mongo

El ejemplo de caché ya distingue una lectura que sale de Mongo de otra que sale de Redis. Aquí cada GET de `p1` escribe `mongo` en el log, aunque Redis esté levantado y el cliente creado. Primero guardas la copia y compruebas que está en Redis. Después la lees antes que Mongo. Al final paras Mongo y la respuesta sigue saliendo.

El JSON de la película y la clave de Redis están en [contrato.json](contrato.json).

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

Al guardar `server.mjs`, o un fichero que ya importe, el proceso se recarga solo. No hace falta Ctrl+C ni volver a lanzar `npm start`. Mongo y Redis no se vacían con esa recarga.

Las mismas peticiones están en `peticiones.http`. Ábrelo y pulsa Send Request encima de la que quieras (extensión REST Client).

### 1 — Guardar la copia, sin leerla todavía

**Acción:** crea `lectura.mjs` con esto. La función sigue yendo a Mongo en cada llamada. Al volver, deja el documento en Redis.

```js
export async function leer(Pelicula, redis, id) {
  // El nombre de la copia lleva el id, para que p1 no pise a otra película.
  // EX 60 hace que caduque: un título viejo no se sirve para siempre.
  const clave = `pelicula:${id}`;
  const doc = await Pelicula.findOne({ id }).lean();
  if (!doc) return null;
  console.log('mongo', id);
  await redis.set(clave, JSON.stringify(doc), 'EX', 60);
  return doc;
}
```

En `server.mjs`, añade el import arriba y sustituye el GET por este.

```js
// leer es quien habla con Mongo y, cuando toque, con Redis.
import { leer } from './lectura.mjs';
```

```js
// Este GET ya no consulta Mongo por su cuenta. De dónde sale el documento lo decide leer.
app.get('/peliculas/:id', async (req, res) => {
  const doc = await leer(Pelicula, redis, req.params.id);
  if (!doc) {
    res.status(404).json({ error: 'no encontrada' });
    return;
  }
  res.json(doc);
});
```

Guarda. Dos GET, y mira la clave. La película sigue en Mongo.

```bash
curl -s http://127.0.0.1:3001/peliculas/p1; echo
curl -s http://127.0.0.1:3001/peliculas/p1; echo
docker exec ms-lab-redis redis-cli get pelicula:p1
echo
docker exec ms-lab-redis redis-cli ttl pelicula:p1
```

**Por qué:** hasta aquí Redis solo recibe. El GET no pregunta si la copia ya estaba, así que las dos lecturas siguen tocando Mongo. El `get` de `redis-cli` demuestra que la copia se escribió.

**Resultado esperado:** los dos cuerpos traen `El faro`. El log dice `mongo p1` dos veces. `get` imprime el JSON con `El faro`. `ttl` es un entero entre 1 y 60.

### 2 — Mirar Redis antes que Mongo

**Acción:** en `leer`, justo debajo de `const clave = ...` y antes del `findOne`, pega esto.

```js
  // La copia se mira antes que Mongo. Si está, la función termina aquí
  // y el findOne de debajo no se ejecuta.
  const cacheado = await redis.get(clave);
  if (cacheado) {
    console.log('redis', id);
    return JSON.parse(cacheado);
  }
```

Guarda. Redis conserva `pelicula:p1` (la recarga no la borra): bórrala para ver las dos líneas en orden.

```bash
docker exec ms-lab-redis redis-cli del pelicula:p1
curl -s http://127.0.0.1:3001/peliculas/p1; echo
curl -s http://127.0.0.1:3001/peliculas/p1; echo
```

**Por qué:** el primer GET no encuentra la clave, lee Mongo y la guarda. El segundo la encuentra y no vuelve a Mongo.

**Resultado esperado:** los dos cuerpos traen `El faro`. El log dice `mongo p1` y después `redis p1`.

### 3 — Para Mongo

**Acción:**

```bash
docker stop ms-lab-mongo
curl -s http://127.0.0.1:3001/peliculas/p1; echo
```

**Por qué:** la respuesta sale de Redis. La clave tiene que existir de antemano: si no está y Mongo está parado, el GET ya no puede rellenar la caché.

**Resultado esperado:** el JSON de `p1` con `El faro`, y una línea `redis p1` en el servidor.

## Así se ve

Los tres GET traen `El faro`. El log pasa de `mongo` a `redis`, y el tercero sigue en `redis` con Mongo parado.

![resultado del laboratorio](resultado.png)

## Comprueba tu entendimiento

**La clave caduca**
`docker exec ms-lab-redis redis-cli ttl pelicula:p1`
→ Un entero entre 1 y 60.

## Reto

### 1 — Un id que no está

Con Mongo en marcha, pide la película `p2`. No está en la semilla. Mira el código HTTP y qué hay en Redis para esa clave.

<details>
<summary>Ver solución</summary>

Con Mongo en marcha (`docker start ms-lab-mongo` si lo paraste en el paso 3):

```bash
curl -s -w '\n%{http_code}\n' http://127.0.0.1:3001/peliculas/p2
docker exec ms-lab-redis redis-cli get pelicula:p2
```

404 `{"error":"no encontrada"}`. `get` responde `(nil)`. `leer` hace `return null` antes del `set`, así que un id que no está en Mongo no deja copia.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| Los dos GET dicen `mongo` | No guardas la clave, el `get` de Redis no está antes del `findOne`, o el proceso no se ha recargado | El `set` está en `leer`, el bloque de `cacheado` va justo debajo de `const clave`, y guardas |
| Los dos GET dicen `redis` | Quedó `pelicula:p1` del paso anterior | `redis-cli del pelicula:p1` y repite los dos curl |
| 500 con Mongo parado | La clave no existía | Repite los dos GET del paso 2 antes de `docker stop` |
