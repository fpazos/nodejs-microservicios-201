// sync crea la tabla en este ejemplo de un solo nodo. upsert deja la
// fila A1. Este proceso cierra; la fila sigue en PostgreSQL.
import { sequelize, Butaca } from './modelo.mjs';

await sequelize.sync();
await Butaca.upsert({ id: 'A1', fila: 'A' });
console.log((await Butaca.findByPk('A1')).toJSON());
await sequelize.close();
