const { DataTypes } = require('sequelize');
const sequelize = require('../../config/sequelize');
const Category = require('./category');
const { uuidv4 } = require('../../config/constant'); 

const Subcategory = sequelize.define('Subcategory', {
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
  category_id: {
    type: DataTypes.UUID,
    references: {
      model: Category,
      key: 'id',
    },
    allowNull: false,
  },
}, {
  tableName: 'sub_categories',
  freezeTableName: true,
  timestamps: true,
});

module.exports = Subcategory;
