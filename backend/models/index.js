const sequelize = require('../config/db');
const User = require('./User');
const SacramentalRequest = require('./SacramentalRequest');
const Document = require('./Document');

// Associations
User.hasMany(SacramentalRequest, { foreignKey: 'userId', as: 'requests', onDelete: 'CASCADE' });
SacramentalRequest.belongsTo(User, { foreignKey: 'userId', as: 'user' });

SacramentalRequest.hasMany(Document, { foreignKey: 'requestId', as: 'documents', onDelete: 'CASCADE' });
Document.belongsTo(SacramentalRequest, { foreignKey: 'requestId', as: 'request' });

module.exports = { sequelize, User, SacramentalRequest, Document };
