# Entorno

Codespace o un Linux con Docker. Node.js 22 (`node -v`). `docker info` tiene que terminar sin error.

Los ejemplos y los laboratorios anteriores al módulo de Kubernetes levantan sus dependencias con Docker Compose. No hace falta entender el Dockerfile para usarlos. La imagen, Compose como tema, y kind, están en el módulo 6.

## Limpiar

Desde la raíz del repo. Borra los contenedores cuyo nombre empieza por `ms-` y el clúster kind `ms`.

```bash
bash scripts/limpiar-entorno.sh
```

Úsalo cuando un puerto (3001, 5432, 6379, 27017, 5672, 9092) esté ocupado por otro ejemplo.

## Codespace: contenedores que no se ven

En algunos Codespaces, un contenedor de Compose no puede abrir conexiones con otro de la misma red. Desde tu terminal todo responde (`curl 127.0.0.1:8500` funciona), pero dentro de Compose el nombre del servicio resuelve y la conexión no llega: el log dice `ConnectTimeoutError` o `fetch failed` y el contenedor acaba en `Exited (1)`. Lo notas sobre todo en Consul, porque el registro y el check van de contenedor a contenedor.

La causa es el firewall del Codespace. Hay reglas antiguas (`iptables-legacy`) que descartan el tráfico entre contenedores salvo en la red por defecto de Docker, y las redes de Compose usan otra interfaz (`br-…`). El script abre esas interfaces y no toca nada si no hace falta:

```bash
bash scripts/red-docker-codespace.sh
```

Lánzalo una vez después de abrir el Codespace, antes de levantar los ejemplos. Las reglas se pierden al reiniciarlo. Para comprobar que funciona, con Consul levantado:

```bash
docker run --rm --network ms-consul_default alpine wget -qO- -T5 http://consul:8500/v1/status/leader
```

Tiene que imprimir una dirección entre comillas en vez de `download timed out`.

## Puertos que aparecen

| Puerto | Quién |
|--------|--------|
| 3001 | La mayoría de los servicios de ejemplo |
| 3002 | CQRS, turnos, portal OAuth |
| 3003 | WebSocket |
| 4000 | Proveedor OAuth |
| 3443 | HTTPS del ejemplo de cifrado |
| 50051 | gRPC |
| 5432 | PostgreSQL |
| 5672 / 15672 | RabbitMQ |
| 6379 | Redis |
| 8080 | Gateway (Express y HAProxy) |
| 8500 | Consul |
| 9090 / 3000 | Prometheus / Grafana |
| 9092 | Kafka |
| 16686 / 4318 | Jaeger |
| 9200 / 5601 | Elasticsearch / Kibana |
| 27017 | MongoDB |

kind y Helm solo en `ejemplos/06-kubernetes`, `ejemplos/06-helm` y `labs/M06-docker-y-kubernetes/lab-kind`.
