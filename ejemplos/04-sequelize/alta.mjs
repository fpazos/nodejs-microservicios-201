import { sequelize, Butaca } from './modelo.mjs';

await sequelize.sync();
await Butaca.upsert({ id: 'A1', fila: 'A' });
console.log((await Butaca.findByPk('A1')).toJSON());
await sequelize.close();
