const { DataTypes } = require('sequelize');
const sequelize = require('../../config/sequelize');
const { uuidv4 } = require('../../config/constant'); 
const MstCountry = require('./MstCountry');

const MstCity = sequelize.define('MstCity', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
  },
  country_id: {
    type: DataTypes.UUID,
    references: {
      model: MstCountry,
      key: 'id',
    },
    allowNull: false,
  },
}, {
  tableName: 'mst_city',
  freezeTableName: true,
  timestamps: true,
});

module.exports = MstCity;