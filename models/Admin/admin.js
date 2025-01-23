// models/admin.js

const { DataTypes } = require("sequelize")
const sequelize = require("../../config/sequelize")
const { uuidv4 } = require("../../config/constant")

const Admin = sequelize.define(
  "Admin",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: uuidv4(),
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    timestamps: true
  }
)

module.exports = Admin
