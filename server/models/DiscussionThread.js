const { DataTypes } = require('sequelize');
const sequelize = require('../../db/db');

const DiscussionThread = sequelize.define('DiscussionThread', {
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
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  body: {
    type: DataTypes.TEXT,
    defaultValue: '',
  }
}, {
  tableName: 'threads',
});

module.exports = DiscussionThread;