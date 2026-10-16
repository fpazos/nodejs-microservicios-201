# M07 — Monitorización y logging

[← M06](../M06-docker-y-kubernetes/README.md) · [Inicio](../../README.md)

Tres preguntas distintas. La métrica dice cuánto. El trazo dice por dónde pasó esta petición. El log es la frase que el proceso escribió.

| Pregunta | Herramienta |
|----------|-------------|
| ¿Cuántos avisos van? | prom-client, Prometheus, Grafana, y una regla si el raspado falla |
| ¿Este GET llegó? | OpenTelemetry y Jaeger |
| ¿Qué línea salió por stdout? | pino, Fluent Bit, Elasticsearch, Kibana |

El recolector del ejemplo de logs es Fluent Bit. Hace el papel que el temario asigna a Fluentd.

## Ejemplos

| Ejemplo | Qué hay |
|---------|---------|
| [Prometheus](../../ejemplos/07-prometheus/README.md) | Contador, Grafana y la alerta `AvisosSinRaspado` |
| [Jaeger](../../ejemplos/07-jaeger/README.md) | El GET de una pieza |
| [Logs](../../ejemplos/07-logs/README.md) | `nota creada` en el índice `notas-logs` |

## Laboratorio

[Votos](lab-metricas/README.md). El POST suma una variable. Prometheus ya rasca el puerto y `/metrics` no existe: lo añades tú.

→ Empieza por **[Prometheus](../../ejemplos/07-prometheus/README.md)**.
