# Dockerfile

La imagen lleva Node 22 y el servidor. El proceso escucha en `0.0.0.0` y corre como usuario `node`. Hasta este módulo, los compose de los ejemplos anteriores se usan sin abrir el Dockerfile: aquí se ve qué había dentro.

## Cómo ejecutarlo

```bash
cd ejemplos/06-dockerfile
docker build -t ms-hola:lab .
docker rm -f ms-hola >/dev/null 2>&1 || true
docker run -d --name ms-hola -p 3001:3001 ms-hola:lab
curl -s http://127.0.0.1:3001/hola
echo
```

## Qué se ve

`{"mensaje":"hola","host":"..."}`. `docker exec ms-hola ps` muestra `node server.mjs`.
