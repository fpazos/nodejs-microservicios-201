# Entorno de laboratorio

El curso corre en un Codespace o en un Linux con Docker. No hace falta instalar Node en el sistema si ya lo trae el Codespace.

## Qué tiene que responder la terminal

```bash
node -v
docker info
curl --version
openssl version
```

`node -v` tiene que ser la rama 22. `docker info` tiene que terminar sin error.

Desde el módulo de Kubernetes, además:

```bash
kind version
kubectl version --client
helm version
```

## Datos que se repiten

| Qué | Valor |
|-----|--------|
| SKU | `NX-1` |
| Producto | `Sobre 1 kg` |
| Pedido | `PED-1001` |
| Operadora | `ana` / rol `operador` |
| Cliente | `luis` / rol `cliente` |

Las contraseñas de cada contenedor están en la página que lo arranca. Son de este laboratorio.

## Puertos

| Puerto | Quién lo usa |
|--------|----------------|
| 3001 | `catalogo` |
| 3002 | `pedidos` |
| 3003 | `notificaciones` o el WebSocket |
| 4000 | Proveedor OAuth del laboratorio |
| 5432 | PostgreSQL |
| 5672 / 15672 | RabbitMQ / consola |
| 6379 | Redis |
| 9092 | Kafka |
| 27017 | MongoDB |
| 9090 / 3000 | Prometheus / Grafana |
| 16686 / 4318 | Jaeger / OTLP HTTP |
| 9200 / 5601 | Elasticsearch / Kibana |

Si un puerto está ocupado, la página que lo usa empieza por `docker rm -f` del nombre que ella misma crea. Un proceso Node de un lab anterior se para con Ctrl+C en esa terminal antes de arrancar el siguiente.

## Dónde se trabaja

Cada página crea una carpeta `~/nexo/<nombre-del-lab>`. No se commitea. El código que hay que guardar es el de las páginas, copiado ahí.
