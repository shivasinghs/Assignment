const { DataTypes } = require('sequelize');
const sequelize = require('../../config/sequelize');
const { uuidv4 } = require('../../config/constant'); 
const MstCity = require('./MstCity');

const MstCityTrans = sequelize.define('MstCityTrans', {
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
    cityId: { 
      type: DataTypes.UUID, 
      field: "city_id", 
      references: { 
        model: MstCity, 
        key: 'id', 
      }, 
      allowNull: false, 
    },
  }, {
    tableName: 'mst_city_trans', 
    freezeTableName: true,
    timestamps: true,
  });

module.exports = MstCityTrans; 