# Logs en Elasticsearch

El proceso escribe JSON por stdout con pino. No conoce Elasticsearch. Fluent Bit lee el log del contenedor y lo entrega al índice `notas-logs`. El temario nombra Fluentd: aquí el recolector es Fluent Bit, el mismo papel en un solo binario. Elasticsearch arranca sin autenticación. Sirve para este ejemplo.

Kibana: http://127.0.0.1:5601

## Cómo ejecutarlo

```bash
cd ejemplos/07-logs
docker compose up --build -d
until curl -sf http://127.0.0.1:9200 >/dev/null; do sleep 3; done
curl -s -X POST http://127.0.0.1:3001/notas
echo
until curl -s 'http://127.0.0.1:9200/notas-logs/_search?q=n1' | grep -q n1; do sleep 2; done
curl -s 'http://127.0.0.1:9200/notas-logs/_search?q=n1'
echo
```

En Kibana: Stack Management, Data Views, patrón `notas-logs`, luego Discover.

## Qué se ve

El POST devuelve `{"id":"n1"}`. La búsqueda del índice contiene `nota creada` y `n1`. `docker inspect ms-notas-log` no muestra una URL de Elasticsearch.
