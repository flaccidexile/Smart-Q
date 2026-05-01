const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const BlockedDate = sequelize.define('BlockedDate', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    unique: true,
  },
}, {
  tableName: 'blocked_dates',
  timestamps: true,
});

module.exports = BlockedDate;
