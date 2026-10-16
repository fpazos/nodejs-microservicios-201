# CQRS

El POST escribe la fila en PostgreSQL y responde 201. El GET no mira esa tabla: lee Redis. La copia a Redis ocurre 1,5 segundos después. En ese hueco el GET responde 404 aunque la fila ya exista.

## Cómo ejecutarlo

Libera 5432 y 6379 si otro ejemplo los usa (`scripts/limpiar-entorno.sh`).

```bash
cd ejemplos/04-cqrs
docker compose up -d
until docker exec ms-pg-comandas pg_isready -U postgres; do sleep 2; done
npm install
npm start
```

```bash
curl -s -w '\n%{http_code}\n' -X POST http://127.0.0.1:3002/comandas
curl -s -w '\n%{http_code}\n' http://127.0.0.1:3002/comandas/C-1
sleep 2
curl -s -w '\n%{http_code}\n' http://127.0.0.1:3002/comandas/C-1
docker exec ms-pg-comandas psql -U postgres -d comandas -c 'select id, plato from comandas;'
```

## Qué se ve

201, luego 404 `aun no proyectado`, luego 200 con `plato` `sopa`. El `select` muestra la fila desde el primer POST.
