# Consul

`reloj` no publica su puerto en el host. Al arrancar se registra en Consul (nombre `reloj`, dirección `reloj`, puerto 3001) con un check HTTP. El cliente pregunta a Consul quién está sano y llama a esa dirección. No tiene el puerto escrito en el código.

UI de Consul: http://127.0.0.1:8500

## Cómo ejecutarlo

```bash
cd ejemplos/03-consul
docker compose up --build
```

`docker compose up` sin `-d` deja los logs a la vista. El cliente termina solo cuando ha impreso la hora.

## Qué se ve

En los logs de `ms-reloj`: `registrado en consul`. En los de `ms-reloj-cliente`: `reloj 3001` y un JSON con `hora` e `id` `reloj-1`. En la UI, el servicio `reloj` está en passing.

Para repetirlo: `docker compose down` y otra vez `docker compose up --build`.
