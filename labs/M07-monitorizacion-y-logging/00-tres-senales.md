# Tres señales

[← Página anterior](README.md) · [Siguiente página →](01-lab-prometheus-grafana.md)

`catalogo` ya puede tener varias copias. Una terminal no basta para saber si Nexo está bien. Hacen falta tres respuestas distintas: cuánto, por dónde pasó esta petición y qué escribió el proceso.

## Punto de partida

- Node.js 22 y Docker.
- Esta página no levanta Prometheus ni Jaeger: fija qué pregunta responde cada herramienta. Los laboratorios arrancan la suya.

```bash
mkdir -p ~/nexo/m07-demo
```

## Recorrido

1. Una métrica es un número en el tiempo. `nexo_productos_altas_total` cuenta altas de SKU. `process_resident_memory_bytes` dice la memoria del proceso. Prometheus rasca `http://catalogo:3001/metrics` cada pocos segundos y guarda la serie. Grafana dibuja esa serie. Ninguna de las dos guarda el JSON del POST.

2. Una alerta es una regla sobre esa serie. «`up` del job `catalogo` es 0 durante un rato» significa que el raspado falla. No hace falta mirar la gráfica para enterarse. En el laboratorio la regla se carga en Prometheus y se consulta por su API.

3. Un trazo es una petición concreta. El GET `/productos/NX-1` de las 10:04, cuánto tardó y qué tramos tuvo. Jaeger lo enseña. OpenTelemetry lo emite desde el proceso. No sustituye al contador: mil peticiones sanas son una gráfica; una petición lenta es un trazo.

4. Un log es la frase que el código decidió escribir. `producto creado` con `sku` `NX-1`. Sale por stdout, en JSON. Fluent Bit lee el log del contenedor y lo entrega a Elasticsearch. Kibana lo busca. El temario llama Fluentd a ese recolector; el laboratorio usa Fluent Bit para el mismo recorrido, porque es el proceso que cabe en este nodo.

5. Las tres pueden mirar el mismo POST y no se pisan. El contador suma uno. El trazo dura unos milisegundos. La línea de log dice el SKU. Si solo hay log, no hay alerta cuando el proceso desaparece. Si solo hay métrica, no se sabe qué SKU falló.

## Qué queda visto

Número, camino y frase. El laboratorio [01 — Prometheus y Grafana](01-lab-prometheus-grafana.md) expone `/metrics`, rasca el catálogo y deja cargada la regla de alerta.
