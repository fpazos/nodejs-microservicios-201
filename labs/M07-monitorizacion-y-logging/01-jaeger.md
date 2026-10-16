# Jaeger

[← Prometheus](00-prometheus.md) · [Siguiente página →](02-logs.md)

El contador dice cuántos. El trazo dice por dónde pasó esta petición. Cada GET de `/piezas/PZ-1` es un trazo distinto, aunque el contador de esa ruta hubiera sumado lo mismo.

El SDK de OpenTelemetry se carga con `--import` antes de que arranque Express, y envía los trazos por OTLP al puerto 4318. El nombre del servicio es `piezas`. Jaeger los recibe y los enseña en el puerto 16686. `OTEL_BSP_SCHEDULE_DELAY=500` acorta la espera antes de enviar el lote, para no quedarse mirando una UI vacía.

El proceso no sabe dibujar. Sabe emitir el span. Jaeger es quien lo guarda.

## Ejemplo

La demostración está en [Jaeger](../../ejemplos/07-jaeger/README.md). `GET /api/services` incluye `piezas`. En la UI, el trazo nombra el GET `/piezas/PZ-1`. Otro GET crea otro trazo.

No hay laboratorio de trazas. Se hace un GET y se busca en Jaeger.
