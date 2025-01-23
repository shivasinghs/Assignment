const { DataTypes } = require('sequelize');
const sequelize = require('../../config/sequelize'); 
const { uuidv4 } = require('../../config/constant'); 

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: uuidv4(), 
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  CompanyName: {
    type: DataTypes.STRING,
    field: 'company_name', 
    allowNull: false,
  },
}, {
  tableName: 'user', 
  freezeTableName: true, 
  timestamps: true, 
});

module.exports = User;
