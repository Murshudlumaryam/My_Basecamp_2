const { DataTypes } = require('sequelize');
const sequelize = require('../../db/db');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  threadId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  projectId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: false,
  }
}, {
  tableName: 'messages',
});

module.exports = Message;