// No hay sync ni upsert. Si imprime A1, la fila estaba en la tabla:
// este proceso no la tenía en memoria.
import { sequelize, Butaca } from './modelo.mjs';

console.log((await Butaca.findByPk('A1')).toJSON());
await sequelize.close();
