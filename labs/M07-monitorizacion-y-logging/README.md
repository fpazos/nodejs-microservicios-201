# M07 — Monitorización y logging

[← Página anterior](../M06-docker-y-kubernetes/04-lab-helm-y-replicas.md) · [Siguiente página →](00-tres-senales.md)

Con varias copias de `catalogo`, la terminal de un proceso ya no cuenta la historia. Este módulo deja tres señales distintas: la métrica, el trazo de una petición y el log en un almacén común.

## Qué aprenderás

- Exponer `/metrics`, rascarlo con Prometheus, verlo en Grafana y cargar una regla de alerta.
- Seguir una petición de `catalogo` en Jaeger.
- Enviar el log JSON a Elasticsearch con Fluent Bit y buscarlo en Kibana.

## Teoría

| Pregunta | Señal | Herramienta en el lab |
|----------|-------|------------------------|
| ¿Cuánta memoria usa el proceso ahora? | Métrica | prom-client, Prometheus, Grafana |
| ¿Esta petición a `/productos/NX-1` llegó y cuánto tardó? | Trazo | OpenTelemetry y Jaeger |
| ¿Qué escribió el proceso cuando creó el SKU? | Log | pino, Fluent Bit, Elasticsearch, Kibana |

Prometheus tira de `/metrics` cada pocos segundos. No guarda el texto de una petición concreta. Jaeger sí guarda ese camino, y no sustituye al contador. El log es lo que el código decidió escribir.

La alerta del laboratorio se dispara cuando Prometheus no consigue rascar el objetivo. Es una regla cargada en caliente: se ve en la API de alertas en cuanto el raspado falla, sin esperar a un incidente largo.

El temario nombra Fluentd como recolector. Aquí el recolector es **Fluent Bit**: lee el log del contenedor y lo entrega a Elasticsearch. El papel es el de Fluentd; la imagen es la que cabe en este nodo.

> [!WARNING]
> Elasticsearch arranca con la seguridad desactivada. Sirve para buscar el log en clase. No es una configuración para llevarse a otro entorno.

## Páginas

| # | Página | Qué hay |
|---|--------|---------|
| 00 | [Tres señales](00-tres-senales.md) | La misma petición mirada como número, como trazo y como línea |
| 01 | [Prometheus y Grafana](01-lab-prometheus-grafana.md) | `/metrics`, una gráfica y la regla de alerta |
| 02 | [Jaeger](02-lab-jaeger.md) | Un trazo del GET de `NX-1` |
| 03 | [Logs](03-lab-logs-efk.md) | El JSON del alta acaba en Elasticsearch |

→ Empieza por **[00 — Tres señales](00-tres-senales.md)**.
