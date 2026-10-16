# Laboratorio: un solo puerto

El ejemplo de gateway ya enruta clima y cotizaciones. Aquí `agenda` y `tiempo` están levantados y no publican puerto. El gateway escucha en el 8080 y solo responde `/salud`. El fichero `gateway/server.mjs` está montado en el contenedor: al guardarlo, `node --watch` reinicia.

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

### 1 — Reenvía agenda

**Acción:** en `gateway/server.mjs`, antes de `listen`:

```js
app.get('/api/agenda/hoy', async (req, res) => {
  const respuesta = await fetch('http://agenda:3001/hoy');
  res.status(respuesta.status).json(await respuesta.json());
});
```

Espera a que el log de `ms-lab-gateway` diga otra vez `gateway en 8080` (`docker logs -f ms-lab-gateway` un momento, o unos segundos).

```bash
curl -s http://127.0.0.1:8080/api/agenda/hoy
echo
```

**Por qué:** el cliente habla con un puerto. El nombre `agenda` solo existe en la red de Compose, que es donde corre el gateway.

**Resultado esperado:** `{"cita":"dentista"}`.

### 2 — Reenvía el tiempo

**Acción:** la misma forma, camino `/api/tiempo/manana`, destino `http://tiempo:3002/manana`.

```bash
curl -s http://127.0.0.1:8080/api/tiempo/manana
echo
```

**Por qué:** el segundo servicio no cambia el puerto público. Cambia el prefijo.

**Resultado esperado:** `{"estado":"lluvia"}`.

## Comprueba tu entendimiento

**Un prefijo que no has escrito**
`curl -s -w '\n%{http_code}\n' http://127.0.0.1:8080/api/agenda/ayer`
→ 404. El gateway no tiene esa ruta, y `agenda` tampoco tiene `/ayer` si la hubieras reenviado tal cual.

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| `fetch failed` en el log del gateway | El destino usa `127.0.0.1` | Desde el gateway los nombres son `agenda` y `tiempo` |
| El curl sigue en 404 después de guardar | `--watch` aún no ha reiniciado | `docker logs --tail 5 ms-lab-gateway` tiene que repetir `gateway en 8080` |
| Cambiaste `agenda/server.mjs` y no se ve | Ese fichero no está montado | `docker compose up --build -d` |
