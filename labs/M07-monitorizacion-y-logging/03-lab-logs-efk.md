# Logs centralizados

[← Página anterior](02-lab-jaeger.md) · [Índice del curso](../../README.md)

Vas a escribir `producto creado` por stdout y a encontrarlo en Elasticsearch. El recolector es Fluent Bit: hace el papel que el temario asigna a Fluentd, en un solo binario.

### Objetivo

Que una búsqueda en el índice `nexo-logs` devuelva un documento con `NX-1`, y que ese documento se vea en Kibana.

### Punto de partida

```bash
mkdir -p ~/nexo/m07-logs && cd ~/nexo/m07-logs
docker rm -f nexo-es nexo-kibana nexo-fluent nexo-log-catalogo >/dev/null 2>&1 || true
```

- Docker. Puertos 3001, 9200 y 5601 libres.
- Hace falta memoria para Elasticsearch (el laboratorio limita el heap a 512 MB).

### En qué consiste

El catálogo corre en un contenedor y escribe JSON. Fluent Bit lee el fichero de log de Docker y lo manda a Elasticsearch. Kibana lee ese índice.

### 1 — Escribe el catálogo

**Acción:** guarda `server.mjs`, `package.json` y `Dockerfile`.

```js
import express from 'express';
import pino from 'pino';

const log = pino();
const app = express();

app.post('/productos', (req, res) => {
  log.info({ sku: 'NX-1', pedido: 'PED-1001' }, 'producto creado');
  res.status(201).json({ sku: 'NX-1' });
});

app.listen(3001, '0.0.0.0', () => console.log('catalogo en 3001'));
```

```json
{
  "name": "catalogo",
  "type": "module",
  "dependencies": {
    "express": "^5.1.0",
    "pino": "^9.6.0"
  }
}
```

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY server.mjs ./
EXPOSE 3001
CMD ["node", "server.mjs"]
```

**Por qué:** pino escribe una línea JSON por stdout. No abre un socket a Elasticsearch. Quien mueve el log es el recolector, así el servicio no conoce el almacén.

**Resultado esperado:** los tres ficheros en la carpeta.

### 2 — Escribe la configuración de Fluent Bit

**Acción:** guarda `fluent-bit.conf`.

```ini
[SERVICE]
    Flush        1
    Parsers_File /fluent-bit/etc/parsers.conf

[INPUT]
    Name              tail
    Path              /var/lib/docker/containers/*/*.log
    Parser            docker
    Tag               nexo.*
    Refresh_Interval  2

[FILTER]
    Name    grep
    Match   *
    Regex   log producto creado

[OUTPUT]
    Name               es
    Match              *
    Host               elasticsearch
    Port               9200
    Index              nexo-logs
    Suppress_Type_Name On
```

**Por qué:** el parser `docker` saca el campo `log` de la línea que añade el motor de contenedores. El filtro se queda con la frase de Nexo y no con el resto de contenedores. `Suppress_Type_Name` hace falta en Elasticsearch 8, que ya no acepta el campo de tipo antiguo.

**Resultado esperado:** `fluent-bit.conf` en la carpeta.

### 3 — Escribe el Compose

**Acción:** guarda `docker-compose.yml`.

```yaml
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.17.0
    container_name: nexo-es
    environment:
      discovery.type: single-node
      xpack.security.enabled: "false"
      ES_JAVA_OPTS: "-Xms512m -Xmx512m"
    ports:
      - "9200:9200"
  kibana:
    image: docker.elastic.co/kibana/kibana:8.17.0
    container_name: nexo-kibana
    environment:
      ELASTICSEARCH_HOSTS: http://elasticsearch:9200
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch
  catalogo:
    build: .
    container_name: nexo-log-catalogo
    ports:
      - "3001:3001"
  fluent-bit:
    image: fluent/fluent-bit:3.2
    container_name: nexo-fluent
    volumes:
      - ./fluent-bit.conf:/fluent-bit/etc/fluent-bit.conf:ro
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
    depends_on:
      - elasticsearch
      - catalogo
```

**Por qué:** los cuatro comparten red, así que Fluent Bit resuelve el nombre `elasticsearch`. La seguridad de Elasticsearch está apagada: este nodo es de laboratorio. Kibana es la lupa; la prueba de que el documento existe es un `curl` al índice.

**Resultado esperado:** `docker-compose.yml` guardado.

### 4 — Levanta y espera a Elasticsearch

**Acción:**

```bash
docker compose up -d --build
until curl -sf http://127.0.0.1:9200 >/dev/null; do sleep 3; done
curl -s http://127.0.0.1:9200
echo
```

**Por qué:** Kibana y Fluent Bit no entregan nada hasta que el nodo de búsqueda responde. El `until` separa esa espera de un fallo de configuración.

**Resultado esperado:** un JSON con `"tagline" : "You Know, for Search"` (o el lema actual del producto) y sin error de autenticación.

### 5 — Provoca el log

**Acción:**

```bash
curl -s -X POST http://127.0.0.1:3001/productos
echo
docker logs nexo-log-catalogo
```

**Por qué:** `docker logs` demuestra que la frase salió del proceso. Todavía no está centralizada: está en el fichero de ese contenedor. El paso siguiente es encontrarla en el índice.

**Resultado esperado:** el POST devuelve `{"sku":"NX-1"}`. En los logs hay una línea JSON con `"msg":"producto creado"` y `"sku":"NX-1"`.

### 6 — Búscala en Elasticsearch

**Acción:**

```bash
until curl -s 'http://127.0.0.1:9200/nexo-logs/_search?q=NX-1' | grep -q NX-1; do sleep 2; done
curl -s 'http://127.0.0.1:9200/nexo-logs/_search?q=NX-1'
echo
```

**Por qué:** cuando el `grep` encuentra `NX-1`, Fluent Bit ya ha entregado la línea. A partir de aquí el log no depende de `docker logs`.

**Resultado esperado:** un JSON de búsqueda con `"sku":"NX-1"` dentro de `_source` o del campo `log`.

### 7 — Mírala en Kibana

**Acción:** abre `http://127.0.0.1:5601`. Cuando la pantalla cargue:

1. Menú **Stack Management**.
2. **Data Views** → **Create data view**.
3. Name: `nexo`. Index pattern: `nexo-logs`. Timestamp: el campo de tiempo que ofrezca (o **I don't want to use the time filter** si aún no hay campo de fecha).
4. **Discover**. El patrón `nexo`. La línea del alta está en la lista.

**Por qué:** Kibana no guarda el log: lee el índice que acabas de comprobar. Discover es la misma búsqueda del `curl`, para quien no va a vivir en la API.

**Resultado esperado:** una fila que contiene `producto creado` y `NX-1`.

## Comprueba tu entendimiento

**El contenedor no habla con Elasticsearch**
```bash
docker inspect nexo-log-catalogo --format '{{json .Config.Env}}'
```
→ No aparece ninguna URL de Elasticsearch. El servicio solo escribe a stdout.

## Reto

### 1 — Un segundo SKU en el mismo índice

Cambia el log a `sku` `NX-2`, reconstruye `catalogo` y búscalo.

<details>
<summary>Ver solución</summary>

En `server.mjs`, el objeto del log pasa a `{ sku: 'NX-2', pedido: 'PED-1001' }`.

```bash
docker compose up -d --build catalogo
curl -s -X POST http://127.0.0.1:3001/productos
until curl -s 'http://127.0.0.1:9200/nexo-logs/_search?q=NX-2' | grep -q NX-2; do sleep 2; done
```

La búsqueda de `NX-2` devuelve un documento. `NX-1` sigue en el índice: centralizar no borra el anterior.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| Elasticsearch no llega a responder | Falta memoria | `docker logs nexo-es`. El heap del compose ya está en 512 MB; cierra otros motores del curso (Kafka, kind, Jaeger) |
| El `until` del índice no termina | Fluent Bit no ve los ficheros de log, o el filtro no coincide | `docker logs nexo-fluent`. Tiene que poder leer `/var/lib/docker/containers` |
| Kibana pide usuario | La imagen arrancó con la seguridad de Elasticsearch activa | `xpack.security.enabled` tiene que ser `false` y los dos tienen que ser la misma rama 8.17 |
