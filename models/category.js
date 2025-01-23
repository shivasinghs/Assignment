const { DataTypes } = require('sequelize');
const sequelize = require('../../config/sequelize');
const { uuidv4 } = require('../../config/constant'); 

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
}, {
  tableName: 'category',
  freezeTableName: true,
  timestamps: true,
});

module.exports = Category;
