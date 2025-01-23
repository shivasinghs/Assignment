const { DataTypes } = require('sequelize');
const sequelize = require('../../config/sequelize');
const { uuidv4 } = require('../../config/constant'); 
const MstCountry = require('./MstCountry');

const MstCountryTrans = sequelize.define('MstCountryTrans', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
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
  tableName: 'mst_country_trans',
  freezeTableName: true,
  timestamps: true,
});

module.exports = MstCountryTrans;