# Docker Compose

`visitas` no usa `127.0.0.1` para Redis. Usa el nombre del servicio, `redis`, que solo existe en la red que crea Compose.

## Cómo ejecutarlo

```bash
cd ejemplos/06-compose
docker compose up --build -d
curl -s http://127.0.0.1:3001/visitas; echo
curl -s http://127.0.0.1:3001/visitas; echo
```

## Qué se ve

`visitas` 1 y luego 2. Redis no tiene puerto publicado en el host: solo lo ve `visitas`.
