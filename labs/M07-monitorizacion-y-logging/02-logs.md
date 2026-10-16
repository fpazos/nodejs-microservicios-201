# Logs

[← Jaeger](01-jaeger.md) · [Inicio](../../README.md)

El log es la frase que el proceso escribió por stdout, otra cosa que la métrica y que el trazo. pino saca una línea JSON, `nota creada`, con el id `n1`, y el proceso no sabe que existe Elasticsearch: no hay URL del índice en su entorno. Fluent Bit lee el log del contenedor, se queda con esa frase y la entrega al índice `notas-logs`. El temario nombra Fluentd; aquí el recolector es Fluent Bit, el mismo papel en un solo binario. Kibana lee ese índice. Elasticsearch arranca con la seguridad desactivada, en el 9200, y Kibana en el 5601. Centralizar es eso: el proceso escribe donde ya escribía, y otro proceso lleva esas líneas a un sitio donde se pueden buscar.

## Ejemplo

La demostración está en [Logs](../../ejemplos/07-logs/README.md). El POST devuelve `{"id":"n1"}`. La búsqueda del índice contiene `nota creada` y `n1`. `docker inspect` del contenedor de la aplicación no muestra una URL de Elasticsearch.

No hay laboratorio de logs. El de este módulo es el contador de la página de Prometheus.
