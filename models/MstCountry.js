const { DataTypes } = require('sequelize');
const sequelize = require('../../config/sequelize');
const { uuidv4 } = require('../../config/constant'); 

const MstCountry = sequelize.define('MstCountry', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
  },
}, {
  tableName: 'mst_country',
  freezeTableName: true,
  timestamps: true,
});

module.exports = MstCountry;
