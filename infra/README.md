# Entorno

Codespace o un Linux con Docker. Node.js 22 (`node -v`). `docker info` tiene que terminar sin error.

Los ejemplos y los laboratorios anteriores al módulo de Kubernetes levantan sus dependencias con Docker Compose. No hace falta entender el Dockerfile para usarlos. La imagen, Compose como tema, y kind, están en el módulo 6.

## Limpiar

Desde la raíz del repo. Borra los contenedores cuyo nombre empieza por `ms-` y el clúster kind `ms`.

```bash
bash scripts/limpiar-entorno.sh
```

Úsalo cuando un puerto (3001, 5432, 6379, 27017, 5672, 9092) esté ocupado por otro ejemplo.

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
| 8080 | Gateway |
| 8500 | Consul |
| 9090 / 3000 | Prometheus / Grafana |
| 9092 | Kafka |
| 16686 / 4318 | Jaeger |
| 9200 / 5601 | Elasticsearch / Kibana |
| 27017 | MongoDB |

kind y Helm solo en `ejemplos/06-kubernetes`, `ejemplos/06-helm` y `labs/M06-docker-y-kubernetes/lab-kind`.
