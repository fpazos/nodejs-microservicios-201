# Gateway

Un solo puerto de cara al cliente. `/api/clima/hoy` lo atiende el servicio `clima`. `/api/cotizaciones/usd` lo atiende `cotizaciones`. El cliente no conoce el 3001 ni el 3002: esos puertos no están publicados.

Cada servicio tiene su Dockerfile en su carpeta.

## Cómo ejecutarlo

```bash
cd ejemplos/03-gateway
docker compose up --build -d
curl -s http://127.0.0.1:8080/api/clima/hoy
echo
curl -s http://127.0.0.1:8080/api/cotizaciones/usd
echo
```

## Qué se ve

`{"ciudad":"Madrid","estado":"nubes"}` y `{"par":"EURUSD","valor":1.08}`. `curl` a `http://127.0.0.1:3001/hoy` no conecta: el servicio solo existe detrás del gateway, en la red de Compose.
