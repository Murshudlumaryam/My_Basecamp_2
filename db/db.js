const { Sequelize } = require('sequelize');
const path = require('path');
const sqlite3 = require('sqlite3');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  dialectModule: sqlite3,
  storage: process.env.VERCEL
    ? path.join('/tmp', 'database.sqlite')
    : path.join(__dirname, 'database.sqlite'),
  logging: false,
});

module.exports = sequelize;
