# Laboratorio: un solo puerto

El ejemplo de gateway ya enruta clima y cotizaciones por un solo puerto. Aquí `agenda` y `tiempo` están levantados y no publican el suyo. El gateway escucha en el 8080 y solo responde `/salud`. Primero reenvías la cita, la pruebas, y después añades el tiempo. El fichero `gateway/server.mjs` está montado en el contenedor, así que al guardarlo `node --watch` reinicia y puedes añadir las rutas sin reconstruir la imagen. `rutas.mjs`, en la misma carpeta, también entra en ese reinicio en cuanto el servidor lo importa.

Los caminos del gateway y el JSON que copia de cada servicio están en [contrato.json](contrato.json).

### Objetivo

Que `curl` al 8080 devuelva la cita y el tiempo, sin poder llamar a los servicios por su puerto.

### Punto de partida

```bash
bash scripts/limpiar-entorno.sh
cd labs/M03-comunicacion-entre-servicios/lab-gateway
docker compose up --build -d
curl -s http://127.0.0.1:8080/salud
echo
```

`{"ok":true}`. `curl http://127.0.0.1:3001/hoy` no conecta.

Las mismas peticiones están en `peticiones.http`. Ábrelo y pulsa Send Request encima de la que quieras (extensión REST Client).

### 1 — La cita, por el 8080

**Acción:** crea `gateway/rutas.mjs` con el reenvío y una sola ruta.

```js
async function reenviar(res, url) {
  // El gateway no inventa el JSON: copia el status y el cuerpo
  // de la respuesta que le dio el servicio de dentro.
  const respuesta = await fetch(url);
  res.status(respuesta.status).json(await respuesta.json());
}

export function montar(app) {
  // El cliente llama al 8080. `agenda` es el nombre en la red de Compose,
  // donde corre este proceso. En tu terminal ese nombre no existe.
  app.get('/api/agenda/hoy', async (req, res) => {
    await reenviar(res, 'http://agenda:3001/hoy');
  });
}
```

En `gateway/server.mjs`, añade el import arriba y, antes de `listen`, esta línea.

```js
// montar añade las rutas que reenvían. /salud sigue siendo la de este fichero.
import { montar } from './rutas.mjs';
```

```js
// Las rutas de dentro se cuelgan aquí. /salud ya estaba y se queda.
montar(app);
```

Espera a que el log de `ms-lab-gateway` diga otra vez `gateway en 8080`.

```bash
curl -s http://127.0.0.1:8080/api/agenda/hoy
echo
curl -s -w '\n%{http_code}\n' http://127.0.0.1:8080/api/tiempo/manana
```

**Por qué:** el cliente habla con un puerto. El nombre `agenda` solo existe en la red de Compose. La ruta del tiempo todavía no está, y ese curl sirve para ver el hueco.

**Resultado esperado:** `{"cita":"dentista"}`. El segundo curl es 404.

### 2 — El tiempo, con el mismo reenvío

**Acción:** dentro de `montar`, después de la ruta de agenda, pega esta.

```js
  // Mismo reenvío, otro servicio. `tiempo` escucha el 3002 dentro de Compose
  // y no publica ese puerto en el host.
  app.get('/api/tiempo/manana', async (req, res) => {
    await reenviar(res, 'http://tiempo:3002/manana');
  });
```

Espera otra vez el log `gateway en 8080`.

```bash
curl -s http://127.0.0.1:8080/api/tiempo/manana
echo
curl -s http://127.0.0.1:8080/api/agenda/hoy
echo
```

**Por qué:** las dos rutas comparten `reenviar`. Cada una nombra su servicio. El puerto 3001 del host sigue cerrado: la cita solo entra por el 8080.

**Resultado esperado:** `{"estado":"lluvia"}` y, otra vez, `{"cita":"dentista"}`.

## Si quieres probar

En `rutas.mjs`, cambia el destino de agenda a `http://agenda:3001/ayer` y espera el reinicio. El `curl` a `/api/agenda/hoy` responde 404: el gateway llega a agenda y agenda no tiene esa ruta. Vuelve a dejar `/hoy`.

## Así se ve

Los dos `curl` al 8080. El puerto 3001 del host no responde.

![resultado del laboratorio](resultado.png)

## Comprueba tu entendimiento

**Un prefijo que no has escrito**
`curl -s -w '\n%{http_code}\n' http://127.0.0.1:8080/api/agenda/ayer`
→ 404. El gateway no tiene esa ruta, y `agenda` tampoco tiene `/ayer` si la hubieras reenviado tal cual.

## Reto

### 1 — La cita con otro camino

Añade `GET /api/citas/hoy` que reenvíe a la misma URL de agenda, `http://agenda:3001/hoy`.

<details>
<summary>Ver solución</summary>

Dentro de `montar`:

```js
  // Otro camino en el 8080. El destino es el mismo /hoy de agenda.
  app.get('/api/citas/hoy', async (req, res) => {
    await reenviar(res, 'http://agenda:3001/hoy');
  });
```

Cuando el log repita `gateway en 8080`:

```bash
curl -s http://127.0.0.1:8080/api/citas/hoy; echo
```

`{"cita":"dentista"}`. Es el mismo `reenviar` y el mismo servicio, con otro camino en el 8080.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| `fetch failed` en el log del gateway | El destino usa `127.0.0.1` | Desde el gateway los nombres son `agenda` y `tiempo` |
| El curl sigue en 404 después de guardar | `--watch` aún no ha reiniciado | `docker logs --tail 5 ms-lab-gateway` tiene que repetir `gateway en 8080` |
| Cambiaste `agenda/server.mjs` y no se ve | Ese fichero no está montado | `docker compose up --build -d` |
