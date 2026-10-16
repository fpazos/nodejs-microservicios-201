# Prometheus, Grafana y alertas

[← Helm](../M06-docker-y-kubernetes/03-helm-y-replicas.md) · [Siguiente página →](01-jaeger.md)

La métrica es un número que alguien viene a buscar. El proceso expone `GET /metrics` y Prometheus lo rasca cada 5 segundos, en el job `avisos`, contra `127.0.0.1:3001`: comparte la red del host con el proceso, así que no hace falta que el proceso le empuje nada. `avisos_total` sube con cada POST a `/avisos`, y Grafana dibuja esa serie en el puerto 3000, con el usuario `admin` y la clave `lab-grafana`. La alerta `AvisosSinRaspado` no mira el contador. Mira `up == 0` durante 15 segundos, que es el tiempo en el que Prometheus ha dejado de poder rascar el proceso. Parar el servidor dispara la alerta. Un contador que no sube es otra pregunta.

El laboratorio de este módulo es el contador. La gráfica y la alerta se ven en el ejemplo.

## Ejemplo

La demostración está en [Prometheus y Grafana](../../ejemplos/07-prometheus/README.md). Un POST deja `avisos_total` en 1, y la query de Prometheus devuelve ese valor. Al parar el proceso, la API de alertas nombra `AvisosSinRaspado`. En Grafana, Explore, la consulta es `avisos_total`.

## Laboratorio

[Votos](lab-metricas/README.md). `POST /votos` suma una variable y no hay `/metrics`. `prom-client` está en el `package.json` y no se usa. Prometheus ya rasca el puerto, en el job `votos`. El contador que falta es `votos_total`.
