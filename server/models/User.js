const { DataTypes } = require('sequelize');
const sequelize = require('../../db/db');
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'user',
  },
}, {
  tableName: 'users',
});

User.findByEmail = async (email) => {
  return User.findOne({ where: { email } });
};

User.createUser = async (data) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  return User.create({
    name: data.name,
    email: data.email,
    password: hashedPassword,
    role: 'user',
  });
};

User.setAdmin = async (id) => {
  const user = await User.findByPk(id);
  if (!user) return null;
  user.role = 'admin';
  await user.save();
  return user;
};

User.removeAdmin = async (id) => {
  const user = await User.findByPk(id);
  if (!user) return null;
  user.role = 'user';
  await user.save();
  return user;
};

User.deleteUser = async (id) => {
  const user = await User.findByPk(id);
  if (user) await user.destroy();
};

module.exports = User;