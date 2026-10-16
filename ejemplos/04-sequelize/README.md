# PostgreSQL y Sequelize

El concepto está en [PostgreSQL y Sequelize](../../labs/M04-estado-y-persistencia/01-sequelize.md).

## Dónde poner el foco

La butaca `A1` es una fila de la tabla `butacas`. El alta crea la tabla en este ejemplo y escribe la fila. La lectura abre la misma base, busca `A1` y no escribe: el objeto que imprime sale de PostgreSQL.

## Archivos

| Archivo | Papel |
|---------|-------|
| `modelo.mjs` | Conexión a `sala` y modelo `Butaca` con clave `id` |
| `alta.mjs` | Crea la tabla, hace upsert de `A1` y cierra |
| `lectura.mjs` | Lee `A1` sin `sync` ni `upsert` |
| `docker-compose.yml` | PostgreSQL 16, contenedor `ms-pg-butacas`, base `sala`, puerto `5432` |
| `package.json` | Scripts `alta` y `lectura`; dependencias `pg` y `sequelize` |

## El código

### `modelo.mjs`

```js
// La butaca es una fila de columnas fijas. El id es la clave de negocio
// (A1), no un serial. Sin timestamps, toJSON es solo id y fila: es lo
// que tiene que salir en consola.
import { Sequelize, DataTypes } from 'sequelize';

// logging en false: si Sequelize imprime el SQL, tapa el JSON que hay que mirar
export const sequelize = new Sequelize('postgres://postgres:lab@127.0.0.1:5432/sala', { logging: false });

export const Butaca = sequelize.define('Butaca', {
  id: { type: DataTypes.STRING, primaryKey: true },
  fila: DataTypes.STRING,
}, { tableName: 'butacas', timestamps: false });
```

### `alta.mjs`

```js
// sync crea la tabla en este ejemplo de un solo nodo. upsert deja la
// fila A1. Este proceso cierra; la fila sigue en PostgreSQL.
import { sequelize, Butaca } from './modelo.mjs';

await sequelize.sync();
await Butaca.upsert({ id: 'A1', fila: 'A' });
console.log((await Butaca.findByPk('A1')).toJSON());
await sequelize.close();
```

### `lectura.mjs`

```js
// No hay sync ni upsert. Si imprime A1, la fila estaba en la tabla:
// este proceso no la tenía en memoria.
import { sequelize, Butaca } from './modelo.mjs';

console.log((await Butaca.findByPk('A1')).toJSON());
await sequelize.close();
```

## Qué hacer

```bash
cd ejemplos/04-sequelize
docker compose up -d
until docker exec ms-pg-butacas pg_isready -U postgres; do sleep 2; done
npm install
npm run alta
npm run lectura
```

## Qué observar

El alta y la lectura imprimen `{ id: 'A1', fila: 'A' }`. La segunda vez el objeto sale de la tabla, no de una variable que el alta hubiera dejado en memoria.

## Qué validar

La segunda impresión sale de la tabla. `lectura` no crea la tabla ni escribe la fila: si se lanza sola contra una base vacía, no tiene de dónde leer `A1`.

![la butaca es una fila](../img/04-sequelize.png)
