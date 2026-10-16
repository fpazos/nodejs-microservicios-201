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
