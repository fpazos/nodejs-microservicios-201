# M07 — Monitorización y logging

[← M06](../M06-docker-y-kubernetes/README.md) · [Siguiente página →](00-prometheus.md)

Observar un servicio es poder contestar tres preguntas distintas. La métrica dice cuánto ha pasado. El trazo dice por dónde fue esta petición. El log es la frase que el proceso escribió al hacerlo.

| Pregunta | Herramienta | Página |
|----------|-------------|--------|
| ¿Cuántos avisos van? | prom-client, Prometheus, Grafana, y una regla si el raspado falla | 00, con laboratorio |
| ¿Este GET llegó? | OpenTelemetry y Jaeger | 01 |
| ¿Qué línea salió por stdout? | pino, Fluent Bit, Elasticsearch, Kibana | 02 |

El recolector de logs es Fluent Bit. Hace el papel que el temario asigna a Fluentd.

## Páginas

| # | Página | Después de explicarla |
|---|--------|------------------------|
| 00 | [Prometheus](00-prometheus.md) | [Ejemplo](../../ejemplos/07-prometheus/README.md) · [laboratorio](lab-metricas/README.md) |
| 01 | [Jaeger](01-jaeger.md) | [Ejemplo](../../ejemplos/07-jaeger/README.md) |
| 02 | [Logs](02-logs.md) | [Ejemplo](../../ejemplos/07-logs/README.md) |

→ Empieza por **[Prometheus](00-prometheus.md)**.
