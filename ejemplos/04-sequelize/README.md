# PostgreSQL y Sequelize

La butaca `A1` es una fila. `sync` crea la tabla en este ejemplo de un solo nodo. `lectura` no llama a `sync` ni a `upsert`.

## Cómo ejecutarlo

```bash
cd ejemplos/04-sequelize
docker compose up -d
until docker exec ms-pg-butacas pg_isready -U postgres; do sleep 2; done
npm install
npm run alta
npm run lectura
```

## Qué se ve

`{ id: 'A1', fila: 'A' }` dos veces. La segunda sale de la tabla, no de la memoria del alta.
