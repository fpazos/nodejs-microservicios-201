import { Sequelize, DataTypes } from 'sequelize';

export const sequelize = new Sequelize('postgres://postgres:lab@127.0.0.1:5432/sala', { logging: false });

export const Butaca = sequelize.define('Butaca', {
  id: { type: DataTypes.STRING, primaryKey: true },
  fila: DataTypes.STRING,
}, { tableName: 'butacas', timestamps: false });
