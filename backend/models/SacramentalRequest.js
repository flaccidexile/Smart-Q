const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SacramentalRequest = sequelize.define('SacramentalRequest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  fullName: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: { notEmpty: true },
  },
  certificateType: {
    type: DataTypes.ENUM('Baptismal', 'Confirmation', 'Marriage', 'Death', 'Mass Intention', 'Appointment'),
    allowNull: false,
  },
  purpose: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Processing', 'Approved', 'Released', 'Rejected', 'Cancelled'),
    defaultValue: 'Pending',
  },
  source: {
    type: DataTypes.ENUM('online', 'kiosk'),
    defaultValue: 'online',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  contactNumber: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  dateOfSacrament: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  appointmentDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  appointmentTime: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  conflictResolved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  paymentMethod: {
    type: DataTypes.ENUM('onsite', 'online'),
    defaultValue: 'onsite',
  },
  paymentStatus: {
    type: DataTypes.ENUM('Unpaid', 'Paid'),
    defaultValue: 'Unpaid',
  },
  amountDue: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  paymentProof: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // userId is added via association (nullable for kiosk/guest)
}, {
  tableName: 'sacramental_requests',
  timestamps: true,
});

module.exports = SacramentalRequest;
