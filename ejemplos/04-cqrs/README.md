# CQRS

El concepto está en [Consistencia eventual y CQRS](../../labs/M04-estado-y-persistencia/03-cqrs.md).

## Dónde poner el foco

El POST escribe la fila en PostgreSQL y responde 201 sin esperar a la copia. El GET no mira esa tabla: lee Redis, y la copia llega 1,5 segundos después. En ese hueco el GET responde 404 aunque la fila ya exista. Pasado el plazo, el mismo GET responde 200.

## Archivos

| Archivo | Papel |
|---------|-------|
| `server.mjs` | POST a PostgreSQL y GET a Redis, con la proyección en diferido |
| `docker-compose.yml` | PostgreSQL 16 (`ms-pg-comandas`, base `comandas`, `5432`) y Redis 7 (`ms-redis-comandas`, `6379`) |
| `package.json` | Script `start`; dependencias `express`, `ioredis`, `pg` y `sequelize` |

## El código

### `server.mjs`

```js
// El POST confirma en PostgreSQL y responde 201 sin esperar a Redis.
// La proyección va 1,5 s después. El GET no mira la tabla: en ese hueco
// la fila ya existe y la respuesta es 404.
import express from 'express';
import { Sequelize, DataTypes } from 'sequelize';
import Redis from 'ioredis';

const sequelize = new Sequelize('postgres://postgres:lab@127.0.0.1:5432/comandas', { logging: false });
const Comanda = sequelize.define('Comanda', {
  id: { type: DataTypes.STRING, primaryKey: true },
  plato: DataTypes.STRING,
}, { tableName: 'comandas', timestamps: false });
await sequelize.sync();

const redis = new Redis('redis://127.0.0.1:6379');
const app = express();

app.post('/comandas', async (req, res) => {
  const comanda = { id: 'C-1', plato: 'sopa' };
  await Comanda.upsert(comanda);
  // Fuera de la respuesta a propósito: el cliente no espera la copia de lectura
  setTimeout(() => {
    redis.set('comanda:C-1', JSON.stringify(comanda));
  }, 1500);
  res.status(201).json(comanda);
});

app.get('/comandas/:id', async (req, res) => {
  // Modelo de lectura distinto del de escritura. Sin clave, 404 aunque el select ya vea la fila.
  const crudo = await redis.get(`comanda:${req.params.id}`);
  if (!crudo) {
    res.status(404).json({ error: 'aun no proyectado' });
    return;
  }
  res.json(JSON.parse(crudo));
});

app.listen(3002, () => console.log('comandas en 3002'));
```

## Qué hacer

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

## Qué observar

El POST responde 201 en cuanto la fila existe. El GET inmediato responde 404 `aun no proyectado`, porque todavía no ha pasado el segundo y medio y la consulta lee Redis, no la tabla. Tras esos dos segundos el mismo GET responde 200 con `plato` `sopa`.

## Qué validar

El `select` muestra la fila `C-1` / `sopa` desde el primer POST. El 404 del medio ocurre con esa fila ya escrita: el GET estaba leyendo Redis, no la tabla.

![404 y luego 200](../img/04-cqrs.png)
