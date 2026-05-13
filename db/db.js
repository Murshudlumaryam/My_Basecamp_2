const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.VERCEL
    ? path.join('/tmp', 'database.sqlite')
    : path.join(__dirname, 'database.sqlite'),
  logging: false,
});

module.exports = sequelize;
