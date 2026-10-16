# Jaeger

[← Página anterior](01-lab-prometheus-grafana.md) · [Siguiente página →](03-lab-logs-efk.md)

Vas a seguir una petición concreta a `NX-1`: no el contador, sino ese GET, con su trazo en Jaeger.

### Objetivo

Ver el servicio `catalogo` en Jaeger y un trazo cuyo nombre de operación es el GET `/productos/NX-1`.

### Punto de partida

```bash
mkdir -p ~/nexo/m07-jaeger && cd ~/nexo/m07-jaeger
npm init -y
npm pkg set type=module
npm install express@5 \
  @opentelemetry/sdk-node \
  @opentelemetry/auto-instrumentations-node \
  @opentelemetry/exporter-trace-otlp-http
docker rm -f nexo-jaeger >/dev/null 2>&1 || true
docker run -d --name nexo-jaeger \
  -e COLLECTOR_OTLP_ENABLED=true \
  -p 16686:16686 \
  -p 4318:4318 \
  jaegertracing/all-in-one:1.62.0
until curl -sf http://127.0.0.1:16686 >/dev/null; do sleep 2; done
```

- Puerto 3001 libre.
- La UI de Jaeger es `http://127.0.0.1:16686`. No pide usuario.

### En qué consiste

Cargas el SDK antes que Express, haces un GET y lo buscas en la UI y en la API.

### 1 — Escribe la instrumentación

**Acción:** guarda `instrumentacion.mjs`.

```js
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({ url: 'http://127.0.0.1:4318/v1/traces' }),
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();
```

**Por qué:** el SDK tiene que envolver `http` y Express antes de que se importen. Por eso no va dentro de `server.mjs`: se carga con `--import`. El nombre del servicio no va aquí; va en la variable `OTEL_SERVICE_NAME`, que es la que Jaeger muestra.

**Resultado esperado:** `instrumentacion.mjs` creado.

### 2 — Escribe el catálogo

**Acción:** guarda `server.mjs`.

```js
import express from 'express';

const app = express();
app.get('/productos/NX-1', (req, res) => {
  res.json({ sku: 'NX-1', nombre: 'Sobre 1 kg', stock: 40 });
});
app.listen(3001, '0.0.0.0', () => console.log('catalogo en 3001'));
```

**Por qué:** la ruta no llama a OpenTelemetry a mano. La instrumentación automática crea el span del GET. Eso es lo que Nexo quiere en todos los servicios, sin repetir el código del trazo en cada controlador.

**Resultado esperado:** `server.mjs` creado.

### 3 — Arranca con el SDK delante

**Acción:**

```bash
OTEL_SERVICE_NAME=catalogo OTEL_BSP_SCHEDULE_DELAY=500 \
  node --import ./instrumentacion.mjs server.mjs
```

**Por qué:** `--import` ejecuta la instrumentación antes del servidor. `OTEL_BSP_SCHEDULE_DELAY` acorta la espera del exportador por lotes para que el trazo llegue a Jaeger en este laboratorio sin quedarse varios segundos en memoria.

**Resultado esperado:** `catalogo en 3001`.

### 4 — Haz la petición

**Acción:** en otra terminal,

```bash
curl -s http://127.0.0.1:3001/productos/NX-1
echo
sleep 1
curl -s http://127.0.0.1:16686/api/services
echo
```

**Por qué:** sin una petición real no hay trazo. La API de Jaeger confirma que el servicio ya está registrado, antes de abrir la UI.

**Resultado esperado:** el JSON del SKU. La lista de servicios incluye `catalogo`.

### 5 — Ábrelo en la UI

**Acción:** entra en `http://127.0.0.1:16686`. En **Service** elige `catalogo`. Pulsa **Find Traces**. Abre el trazo de arriba.

**Por qué:** la lista de servicios no enseña la petición. El trazo sí: la operación del GET y su duración. Eso es lo que no está en el contador de Prometheus.

**Resultado esperado:** un trazo con una operación que menciona `GET` y `/productos/NX-1`.

## Comprueba tu entendimiento

**Otra petición, otro trazo**
```bash
curl -s http://127.0.0.1:3001/productos/NX-1 >/dev/null
```
Vuelve a **Find Traces**.
→ Hay más de un trazo. Cada GET es un camino, no un incremento del mismo número.

## Reto

### 1 — Sin el import no hay servicio

Para el servidor y arráncalo con `node server.mjs`, sin `--import`. Repite el GET y consulta `/api/services`.

<details>
<summary>Ver solución</summary>

```bash
node server.mjs
curl -s http://127.0.0.1:3001/productos/NX-1
curl -s http://127.0.0.1:16686/api/services
```

El GET sigue devolviendo el JSON de `NX-1`. Si Jaeger se reinició vacío, `catalogo` no aparece. El trazo no es parte de Express: lo añade el SDK. Vuelve a la forma del paso 3 para seguir emitiendo.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| `/api/services` no lista `catalogo` | Falta `--import`, o Jaeger aún no recibió el lote | El comando del paso 3, y el `sleep 1` después del GET |
| `ECONNREFUSED` al puerto 4318 | El contenedor no está | `docker ps` tiene que mostrar `nexo-jaeger` |
| La UI no tiene el servicio en el desplegable | El GET se hizo antes de arrancar Jaeger | Repite el `curl` al catálogo |
