# Laboratorio: el CSV sin doble espera

El ejemplo de proxy inverso compara las dos entradas al mismo informe. Aquí `facturas` exporta un CSV de 200 KB en 2 s y no publica su puerto. El gateway del 8080 lo reenvía como en la página 06: espera el CSV entero y luego lo manda. Primero mides esa espera con un cliente lento. Después añades un proxy inverso y mides lo mismo. `gateway/server.mjs` está montado en el contenedor, así que al guardarlo `node --watch` lo reinicia sin reconstruir. `http-proxy-middleware` ya está instalado en la imagen.

Los caminos y los tiempos esperados están en [contrato.json](contrato.json).

### Objetivo

Que el mismo CSV llegue en unos 2 s en vez de 4 s, con el primer byte casi al instante, y ver que el proxy reenvía rutas que no has escrito.

### Punto de partida

```bash
bash scripts/limpiar-entorno.sh
bash scripts/red-docker-codespace.sh
cd labs/M03-comunicacion-entre-servicios/lab-proxy
docker compose up --build -d
curl -s http://127.0.0.1:8080/salud
echo
node medir.mjs /api/facturas/csv
```

`{"ok":true}` y después algo como `200 /api/facturas/csv  primer byte 2.1 s  total 4.1 s  (204800 bytes)`. `medir.mjs` lee a 100 KB/s, así que descargar 200 KB le cuesta 2 s. Los otros 2 s son la espera hasta que el gateway termina de reunir el CSV.

`red-docker-codespace.sh` es para el Codespace: sin él, el gateway no alcanza a `facturas` dentro de Compose. Fuera de un Codespace no hace nada.

Las peticiones con curl están en `peticiones.http`. Ábrelo y pulsa Send Request encima de la que quieras (extensión REST Client). Los tiempos se miden con `medir.mjs`.

### 1 — El CSV por un proxy inverso

**Acción:** en `gateway/server.mjs`, añade el import arriba y, antes de `listen`, la línea del proxy.

```js
// Un proxy inverso dentro de Express. No lee el cuerpo: lo encadena.
import { createProxyMiddleware } from 'http-proxy-middleware';
```

```js
// Todo lo que empiece por /proxy va a facturas sin el prefijo:
// /proxy/csv llega como /csv. Cualquier método, cabeceras y cuerpo incluidos.
app.use('/proxy', createProxyMiddleware({ target: 'http://facturas:3001' }));
```

Espera a que `docker logs --tail 3 ms-lab-proxy-gateway` repita `gateway en 8080`.

```bash
node medir.mjs /api/facturas/csv
node medir.mjs /proxy/csv
```

**Por qué:** la ruta a mano está parada en `await respuesta.text()` hasta que llega el último byte, y solo entonces el cliente empieza a descargar. El proxy pasa cada bloque al cliente en cuanto `facturas` lo escribe, así que generar y descargar ocurren a la vez.

**Resultado esperado:** la primera línea sigue en unos 2 s de primer byte y 4 s de total. La segunda baja a menos de 0,1 s de primer byte y unos 2 s de total. Las dos con `204800 bytes`.

### 2 — Lo que el proxy reenvía sin escribirlo

**Acción:** no cambies nada. `facturas` también tiene `/resumen`, y el gateway no tiene ninguna ruta para él.

```bash
curl -s http://127.0.0.1:8080/proxy/resumen
echo
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:8080/api/facturas/resumen
```

**Por qué:** el proxy cubre un prefijo entero, no un camino. Cualquier ruta nueva de `facturas` entra por `/proxy` sin tocar el gateway. La entrada a mano solo conoce el camino que alguien escribió.

**Resultado esperado:** `{"facturas":10,"total":1250}` y después `404`.

## Comprueba tu entendimiento

**El orden de los middlewares**
Mueve la línea `app.use('/proxy', ...)` debajo de `app.listen(...)` y guarda. `node medir.mjs /proxy/csv` sigue funcionando: `app.use` registra el middleware aunque el servidor ya escuche. Ahora cambia el prefijo a `/api/facturas` y deja la línea antes de la ruta a mano. `node medir.mjs /api/facturas/csv` baja a unos 2 s: Express prueba los middlewares en orden y el proxy contesta primero. Vuelve a dejarlo en `/proxy`.

## Reto

### 1 — La ruta pública por el proxy

Haz que `/api/facturas/csv` vaya por el proxy, quita la ruta a mano y comprueba que `/api/facturas/resumen` responde.

<details>
<summary>Ver solución</summary>

Borra el `app.get('/api/facturas/csv', ...)` y añade, antes de `listen`:

```js
// El prefijo público entero va a facturas. /api/facturas/csv llega como /csv.
app.use('/api/facturas', createProxyMiddleware({ target: 'http://facturas:3001' }));
```

```bash
node medir.mjs /api/facturas/csv
curl -s http://127.0.0.1:8080/api/facturas/resumen; echo
```

Unos 2 s de total y `{"facturas":10,"total":1250}`. El cliente no ve ningún cambio de URL: solo deja de esperar el doble.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| `Cannot find package 'http-proxy-middleware'` en el log | La imagen es de antes de añadir la dependencia | `docker compose up --build -d` |
| `/proxy/csv` responde 404 de `facturas` | El target lleva el camino (`http://facturas:3001/csv`) | El target es solo `http://facturas:3001`. El camino viene de la petición |
| 504 o `ECONNREFUSED` en el log del gateway | El target usa `127.0.0.1`, o en el Codespace los contenedores no se ven | El destino es `facturas`. En el Codespace, `bash scripts/red-docker-codespace.sh` |
| Las dos medidas dan unos 2 s | Mediste con `curl --limit-rate`, que limita la media y no frena tras la espera inicial | Usa `node medir.mjs` |
