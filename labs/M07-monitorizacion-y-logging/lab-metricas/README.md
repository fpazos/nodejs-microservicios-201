# Laboratorio: un contador que Prometheus pueda rascar

El ejemplo de Prometheus ya expone `/metrics` y deja que Prometheus lo rasque. Aquí el POST solo suma una variable, y esa variable no sale del proceso. El compose ya apunta a tu puerto 3001. Primero publicas `/metrics` con el contador a cero y compruebas que los POST no lo mueven. Después lo incrementas en el POST. Al final le preguntas a Prometheus. Jaeger y los logs se miran en sus ejemplos.

El POST, la línea de `/metrics` y la query de Prometheus están en [contrato.json](contrato.json).

### Objetivo

Tras dos POST, la query `votos_total` en Prometheus vale 2.

### Punto de partida

```bash
bash scripts/limpiar-entorno.sh
cd labs/M07-monitorizacion-y-logging/lab-metricas
npm install
npm start
```

En otra terminal, desde esta carpeta:

```bash
docker compose up -d
curl -s -X POST http://127.0.0.1:3001/votos; echo
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3001/metrics
```

El POST devuelve `{"votos":1}`. `/metrics` responde 404.

Al guardar `server.mjs`, o un fichero que ya importe, el proceso se recarga solo. No hace falta Ctrl+C ni volver a lanzar `npm start`. `votos` y `votos_total` vuelven a 0. Si el paso depende de ese número, repite los POST después del guardado.

Las mismas peticiones están en `peticiones.http`. Ábrelo y pulsa Send Request encima de la que quieras (extensión REST Client).

### 1 — Publicar el contador, sin sumarlo

**Acción:** crea `metricas.mjs` con el registro, el contador y la ruta.

```js
import client from 'prom-client';

// Registro propio, para no mezclar este contador con los que
// prom-client trae por defecto.
const registro = new client.Registry();

// El nombre que Prometheus va a rascar. La variable `votos` del
// proceso es otra cosa y no sale en este texto.
export const votosTotal = new client.Counter({
  name: 'votos_total',
  help: 'Votos recibidos',
  registers: [registro],
});

export function montarMetricas(app) {
  // Prometheus lee este texto. Sin la ruta, el job votos rasca un 404.
  app.get('/metrics', async (req, res) => {
    res.set('Content-Type', registro.contentType);
    res.end(await registro.metrics());
  });
}
```

En `server.mjs`, añade el import arriba y llama a `montarMetricas(app)` antes de `listen`. El POST no se toca: todavía no hay `inc()`.

```js
// montarMetricas publica /metrics. El POST, de momento, no suma el contador.
import { montarMetricas } from './metricas.mjs';
```

```js
// Antes de listen, para que la ruta exista en cuanto el proceso arranque.
montarMetricas(app);
```

Guarda. `votos` y el contador vuelven a 0.

```bash
curl -s http://127.0.0.1:3001/metrics | grep votos_total
curl -s -X POST http://127.0.0.1:3001/votos; echo
curl -s http://127.0.0.1:3001/metrics | grep votos_total
```

**Por qué:** la ruta ya existe y el contador está registrado, así que sale en el texto. Nadie llama a `inc()`, y la variable `votos` del JSON no es ese contador.

**Resultado esperado:** el `grep` saca la ayuda, el tipo y el valor. El valor es `votos_total 0` las dos veces, también después del POST. El POST responde `{"votos":1}`.

### 2 — Sumar en el POST

**Acción:** amplía el import y, dentro del POST, junto a `votos += 1`, añade el incremento.

```js
// votosTotal es el contador. montarMetricas sigue siendo quien expone /metrics.
import { montarMetricas, votosTotal } from './metricas.mjs';
```

```js
  // La variable sigue en el JSON. El contador es lo que sale en /metrics.
  votosTotal.inc();
```

Guarda. El contador vuelve a 0. Haz dos POST y mira el texto.

```bash
curl -s -X POST http://127.0.0.1:3001/votos; echo
curl -s -X POST http://127.0.0.1:3001/votos; echo
curl -s http://127.0.0.1:3001/metrics | grep votos_total
```

**Por qué:** cada POST suma uno en los dos sitios. Prometheus no lee `votos`. Lee `votos_total`.

**Resultado esperado:** `{"votos":1}`, `{"votos":2}`, y entre las líneas del `grep` está `votos_total 2`.

### 3 — Pregunta a Prometheus

**Acción:**

```bash
until curl -sf http://127.0.0.1:9090/-/ready; do sleep 2; done
curl -s 'http://127.0.0.1:9090/api/v1/query?query=votos_total'
echo
```

**Por qué:** el raspado es lo que saca el número del proceso. La query es la prueba de que Prometheus, en la red del host, llega a `127.0.0.1:3001`. El intervalo del scrape es 5 segundos: si acabas de reiniciar, el valor puede tardar un raspado.

**Resultado esperado:** un `"value"` cuyo segundo elemento es `"2"`.

## Así se ve

`/metrics` trae `votos_total 2`. La query de Prometheus devuelve ese mismo `"2"`.

![resultado del laboratorio](resultado.png)

## Comprueba tu entendimiento

**Parar el proceso no borra la serie al instante**
Ctrl+C en el servidor y repite la query.
→ Sigue apareciendo el último valor, y `up{job="votos"}` pasa a `0` en el siguiente raspado. Arranca otra vez `npm start` si vas a seguir.

## Reto

### 1 — Un voto más

Deja el proceso en marcha y el contador en 2 (si lo paraste, arranca y haz dos POST). Haz un tercero y vuelve a mirar `/metrics` y la query.

<details>
<summary>Ver solución</summary>

```bash
curl -s -X POST http://127.0.0.1:3001/votos; echo
curl -s http://127.0.0.1:3001/metrics | grep votos_total
sleep 5
curl -s 'http://127.0.0.1:9090/api/v1/query?query=votos_total'
echo
```

El POST responde `{"votos":3}`. El `grep` muestra `votos_total 3`. Tras el raspado, el `"value"` de Prometheus trae `"3"`.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| La query no trae `result` | `/metrics` no existe o Prometheus no está en la red del host | `curl` local a `/metrics` primero. El compose usa `network_mode: host` |
| `votos_total` no está en `/metrics` | El contador no se registró en `registro` | `registers: [registro]` y la ruta usa `registro.metrics()` |
| El contador sube en el paso 1 | El `inc()` ya está en el POST | Hasta el paso 2 el POST solo hace `votos += 1` |
