# Jaeger

Una petición concreta, no un contador. El SDK se carga con `--import` antes de Express y envía el trazo a Jaeger por OTLP en el puerto 4318.

## Cómo ejecutarlo

```bash
docker rm -f ms-jaeger >/dev/null 2>&1 || true
docker run -d --name ms-jaeger -e COLLECTOR_OTLP_ENABLED=true -p 16686:16686 -p 4318:4318 jaegertracing/all-in-one:1.62.0
cd ejemplos/07-jaeger
npm install
OTEL_SERVICE_NAME=piezas OTEL_BSP_SCHEDULE_DELAY=500 npm start
```

```bash
curl -s http://127.0.0.1:3001/piezas/PZ-1
echo
sleep 1
curl -s http://127.0.0.1:16686/api/services
echo
```

UI: http://127.0.0.1:16686 servicio `piezas`, Find Traces.

## Qué se ve

`/api/services` incluye `piezas`. El trazo nombra el GET `/piezas/PZ-1`. Otro GET crea otro trazo.
