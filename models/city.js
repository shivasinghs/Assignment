const { DataTypes } = require('sequelize');
const sequelize = require('../../config/sequelize');
const Country = require('./country');
const { uuidv4 } = require('../../config/constant'); 

const City = sequelize.define('City', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
  },
  name_en: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name_de: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  country_id: {
    type: DataTypes.UUID,
    references: {
      model: Country,
      key: 'id',
    },
    allowNull: false,
  },
}, {
  tableName: 'cities',
  freezeTableName: true,
  timestamps: true,
});

module.exports = City;
