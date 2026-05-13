const { DataTypes } = require('sequelize');
const sequelize = require('../../db/db');

const Attachment = sequelize.define('Attachment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  projectId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  originalName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  storedName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  format: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  size: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  }
}, {
  tableName: 'attachments',
});

module.exports = Attachment;