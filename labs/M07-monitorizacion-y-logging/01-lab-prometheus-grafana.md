# Prometheus y Grafana

[← Página anterior](00-tres-senales.md) · [Siguiente página →](02-lab-jaeger.md)

Vas a exponer el contador de altas de Nexo, verlo en Prometheus y en Grafana, y dejar una alerta que se activa cuando el raspado deja de funcionar.

### Objetivo

Consultar `nexo_productos_altas_total` con valor 1 y, al parar el proceso, ver la alerta `CatalogoSinRaspado` en la API de Prometheus.

### Punto de partida

```bash
mkdir -p ~/nexo/m07-metrics && cd ~/nexo/m07-metrics
npm init -y
npm pkg set type=module
npm install express@5 prom-client
docker rm -f nexo-prometheus nexo-grafana >/dev/null 2>&1 || true
```

- Puertos 3001, 9090 y 3000 libres.
- Docker con `host-gateway` (Docker Engine actual en Linux).

### En qué consiste

El proceso Node sirve `/metrics`. Prometheus lo rasca. Grafana lee a Prometheus. La regla mira el target `up`.

### 1 — Escribe el catálogo con métricas

**Acción:** guarda `server.mjs`.

```js
import express from 'express';
import client from 'prom-client';

const registro = new client.Registry();
client.collectDefaultMetrics({ register: registro });
const altas = new client.Counter({
  name: 'nexo_productos_altas_total',
  help: 'Altas de SKU en el catalogo de Nexo',
  registers: [registro],
});

const app = express();
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', registro.contentType);
  res.end(await registro.metrics());
});
app.post('/productos', (req, res) => {
  altas.inc();
  res.status(201).json({ sku: 'NX-1', nombre: 'Sobre 1 kg', stock: 40 });
});
app.listen(3001, '0.0.0.0', () => console.log('catalogo en 3001'));
```

**Por qué:** sin `/metrics`, Prometheus no tiene de dónde tirar. El contador es el número de negocio; las métricas por defecto (memoria, CPU del proceso) vienen de `collectDefaultMetrics`.

**Resultado esperado:** `server.mjs` creado.

### 2 — Arranca y da de alta el SKU

**Acción:**

```bash
node server.mjs
```

En otra terminal:

```bash
curl -s -X POST http://127.0.0.1:3001/productos
echo
curl -s http://127.0.0.1:3001/metrics | grep nexo_productos_altas_total
```

**Por qué:** el POST es el hecho. La línea del contador es la señal, sin el JSON del producto.

**Resultado esperado:** el POST devuelve el JSON de `NX-1`. El `grep` muestra `nexo_productos_altas_total 1`.

### 3 — Escribe la configuración de Prometheus

**Acción:** guarda `prometheus.yml` y `alertas.yml`.

```yaml
global:
  scrape_interval: 5s
rule_files:
  - /etc/prometheus/alertas.yml
scrape_configs:
  - job_name: catalogo
    static_configs:
      - targets: ["host.docker.internal:3001"]
```

```yaml
groups:
  - name: nexo
    rules:
      - alert: CatalogoSinRaspado
        expr: up{job="catalogo"} == 0
        for: 15s
        labels:
          gravedad: aviso
        annotations:
          resumen: Prometheus no rasca el catalogo
```

**Por qué:** `host.docker.internal` es el portátil visto desde el contenedor, que es donde escucha Node. La regla no mira el contador de altas: mira si el raspado vive. Es la alerta de «el proceso ha desaparecido».

**Resultado esperado:** los dos YAML están en la carpeta.

### 4 — Levanta Prometheus y Grafana

**Acción:** guarda `docker-compose.yml` y levántalo.

```yaml
services:
  prometheus:
    image: prom/prometheus:v2.55.1
    container_name: nexo-prometheus
    ports:
      - "9090:9090"
    extra_hosts:
      - "host.docker.internal:host-gateway"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - ./alertas.yml:/etc/prometheus/alertas.yml:ro
  grafana:
    image: grafana/grafana:11.3.1
    container_name: nexo-grafana
    ports:
      - "3000:3000"
    environment:
      GF_SECURITY_ADMIN_USER: admin
      GF_SECURITY_ADMIN_PASSWORD: nexo-lab
```

```bash
docker compose up -d
until curl -sf http://127.0.0.1:9090/-/ready; do sleep 2; done
```

**Por qué:** Prometheus y Grafana quedan en la misma red de Compose. La clave de Grafana es `nexo-lab`, no la de fábrica, para entrar directo.

**Resultado esperado:** `/-/ready` responde. `docker compose ps` muestra los dos servicios.

### 5 — Comprueba el raspado

**Acción:**

```bash
curl -s 'http://127.0.0.1:9090/api/v1/query?query=nexo_productos_altas_total' 
echo
```

**Por qué:** si el target no resuelve, Grafana no tendrá nada que dibujar. Esta consulta es la prueba del raspado.

**Resultado esperado:** un JSON con `"value":[...,"1"]` (el contador que subiste en el paso 2).

### 6 — Da de alta el datasource y ábrelo

**Acción:**

```bash
until curl -sf http://127.0.0.1:3000/api/health; do sleep 2; done
curl -s -u admin:nexo-lab -H 'Content-Type: application/json' \
  -d '{"name":"Prometheus","type":"prometheus","access":"proxy","url":"http://prometheus:9090","isDefault":true}' \
  http://127.0.0.1:3000/api/datasources
echo
```

Abre `http://127.0.0.1:3000`. Entra con usuario `admin` y clave `nexo-lab`. Menú **Explore** (brújula). Arriba, el origen **Prometheus**. En la consulta, escribe `nexo_productos_altas_total` y pulsa **Run query**.

**Por qué:** la API deja el datasource creado con la URL interna `http://prometheus:9090`, que es el nombre del servicio. Explore es la gráfica de esa serie, sin montar todavía un panel guardado.

**Resultado esperado:** el `curl` del datasource responde `"datasource"` y no `"message":"Invalid username"`. En Explore, la serie vale 1.

### 7 — Dispara la alerta

**Acción:** en la terminal de `node server.mjs`, Ctrl+C. Luego:

```bash
until curl -s http://127.0.0.1:9090/api/v1/alerts | grep -q CatalogoSinRaspado; do sleep 2; done
curl -s http://127.0.0.1:9090/api/v1/alerts
echo
```

**Por qué:** con el proceso parado, `up` pasa a 0. La cláusula `for: 15s` espera un poco para no avisar por un raspado suelto. La API de alertas es el sitio donde Nexo miraría antes de abrir la gráfica.

**Resultado esperado:** el JSON nombra `CatalogoSinRaspado`. El estado acaba en `firing`.

## Comprueba tu entendimiento

**Al volver el proceso, el target revive**
Arranca otra vez `node server.mjs` y espera a un raspado:
```bash
curl -s 'http://127.0.0.1:9090/api/v1/query?query=up{job="catalogo"}'
```
→ El valor es `"1"`.

## Reto

### 1 — Suma otra alta

Con el servidor en marcha, haz un segundo POST y vuelve a consultar el contador.

<details>
<summary>Ver solución</summary>

```bash
curl -s -X POST http://127.0.0.1:3001/productos
curl -s 'http://127.0.0.1:9090/api/v1/query?query=nexo_productos_altas_total'
```

El valor pasa a `"2"` en cuanto Prometheus rasca (unos segundos). El contador no vuelve a 0 al consultar: solo sube.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| La query no tiene `result` | Prometheus no llega al host | `extra_hosts` con `host-gateway`, y el `node` escuchando en `0.0.0.0` |
| Grafana 401 | La clave no es `nexo-lab` | El entorno del compose fija `GF_SECURITY_ADMIN_PASSWORD` |
| La alerta no aparece | El proceso sigue vivo, o no ha pasado el `for` | Ctrl+C en `server.mjs` y deja el `until` terminar |
