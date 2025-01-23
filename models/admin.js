const { DataTypes } = require("sequelize");
const sequelize = require("../../config/sequelize");
const { uuidv4 } = require("../../config/constant");

const Admin = sequelize.define(
  "Admin",
  {
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
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    createdAt: {
      type: DataTypes.INTEGER, 
      allowNull: false,
      defaultValue: Math.floor(Date.now() / 1000),
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    updatedAt: {
      type: DataTypes.INTEGER, 
      allowNull: false,
      defaultValue: Math.floor(Date.now() / 1000),
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "admin",
    freezeTableName: true,
    timestamps: false,
  }
);

module.exports = Admin;