# Prometheus, Grafana y una alerta

`/metrics` expone el contador `avisos_total`. Prometheus lo rasca cada 5 segundos. Grafana lee a Prometheus. La regla `AvisosSinRaspado` se dispara cuando el proceso deja de responder.

## Cómo ejecutarlo

```bash
cd ejemplos/07-prometheus
npm install
npm start
```

En otra terminal:

```bash
curl -s -X POST http://127.0.0.1:3001/avisos
docker compose up -d
until curl -sf http://127.0.0.1:9090/-/ready; do sleep 2; done
curl -s 'http://127.0.0.1:9090/api/v1/query?query=avisos_total'
echo
```

Grafana: http://127.0.0.1:3000 usuario `admin`, clave `lab-grafana`. Explore, consulta `avisos_total`.

Para ver la alerta, Ctrl+C en el servidor y:

```bash
until curl -s http://127.0.0.1:9090/api/v1/alerts | grep -q AvisosSinRaspado; do sleep 2; done
```

## Qué se ve

La query devuelve el valor `1`. Tras parar el proceso, la API de alertas nombra `AvisosSinRaspado`.
