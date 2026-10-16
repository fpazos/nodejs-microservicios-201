import { sequelize, Butaca } from './modelo.mjs';

console.log((await Butaca.findByPk('A1')).toJSON());
await sequelize.close();
