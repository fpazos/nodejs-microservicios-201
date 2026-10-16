# Prometheus, Grafana y alertas

[← Helm](../M06-docker-y-kubernetes/03-helm-y-replicas.md) · [Siguiente página →](01-jaeger.md)

La métrica es un número que alguien viene a buscar. El proceso expone `GET /metrics`. Prometheus lo rasca cada 5 segundos, en el job `avisos`, contra `host.docker.internal:3001`. No hace falta que el proceso empuje nada.

`avisos_total` es un contador. Cada POST a `/avisos` lo incrementa. Grafana lee a Prometheus y dibuja esa serie. Usuario `admin`, clave `lab-grafana`, puerto 3000.

La alerta `AvisosSinRaspado` no mira el contador. Mira `up == 0` durante 15 segundos: Prometheus dejó de poder rascar el proceso. Parar el servidor dispara la alerta. Un contador que no sube es otra pregunta.

El laboratorio de este módulo es el contador. La gráfica y la alerta se ven en el ejemplo.

## Ejemplo

La demostración está en [Prometheus y Grafana](../../ejemplos/07-prometheus/README.md). Un POST deja `avisos_total` en 1, y la query de Prometheus devuelve ese valor. Al parar el proceso, la API de alertas nombra `AvisosSinRaspado`. En Grafana, Explore, la consulta es `avisos_total`.

## Laboratorio

[Votos](lab-metricas/README.md). `POST /votos` suma una variable y no hay `/metrics`. `prom-client` está en el `package.json` y no se usa. Prometheus ya rasca el puerto, en el job `votos`. El contador que falta es `votos_total`.
