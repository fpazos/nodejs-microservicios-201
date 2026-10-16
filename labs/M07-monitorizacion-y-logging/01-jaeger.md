# Jaeger

[← Prometheus](00-prometheus.md) · [Siguiente página →](02-logs.md)

Prometheus cuenta cuántas peticiones hubo. Jaeger guarda el recorrido de una en concreto, así que cada GET de `/piezas/PZ-1` es un trazo distinto aunque el contador de esa ruta hubiera sumado lo mismo. Para que ese trazo exista, el SDK de OpenTelemetry se carga con `--import` antes de que arranque Express y envía los spans por OTLP al puerto 4318. Jaeger los recibe con el nombre `piezas` y los enseña en el 16686. `OTEL_BSP_SCHEDULE_DELAY=500` acorta la espera del lote, para que el trazo aparezca sin quedarse mirando la UI vacía. El proceso solo emite el span. Quien lo guarda y lo dibuja es Jaeger.

## Ejemplo

La demostración está en [Jaeger](../../ejemplos/07-jaeger/README.md). `GET /api/services` incluye `piezas`. En la UI, el trazo nombra el GET `/piezas/PZ-1`. Otro GET crea otro trazo.

No hay laboratorio de trazas. Se hace un GET y se busca en Jaeger.
