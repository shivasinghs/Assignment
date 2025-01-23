const { DataTypes } = require('sequelize');
const sequelize = require('../../config/sequelize');
const { uuidv4 } = require('../../config/constant'); 

const Country = sequelize.define('Country', {
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
}, {
  tableName: 'countries',
  freezeTableName: true,
  timestamps: true,
});

module.exports = Country;
