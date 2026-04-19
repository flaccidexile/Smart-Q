const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Document = sequelize.define('Document', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  filename: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  storedPath: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  mimeType: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'documents',
  timestamps: true,
  updatedAt: false,
});

module.exports = Document;
