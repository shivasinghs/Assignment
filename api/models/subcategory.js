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
  categoryId: {
    type: DataTypes.UUID,
    field: 'category_id',
    references: {
      model: Category,
      key: 'id',
    },
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    field: 'is_active',
    defaultValue: true,
  },
  createdAt: {
    type: DataTypes.INTEGER,
    field: 'created_at',
    allowNull: false,
    defaultValue: Math.floor(Date.now() / 1000),
  },
  createdBy: {
    type: DataTypes.UUID,
    field: 'created_by',
    allowNull: true,
  },
  updatedAt: {
    type: DataTypes.INTEGER,
    field: 'updated_at',
    allowNull: false,
  },
  updatedBy: {
    type: DataTypes.UUID,
    field: 'updated_by',
    allowNull: true,
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    field: 'is_deleted',
    defaultValue: false,
  },
  deletedBy: {
    type: DataTypes.UUID,
    field: 'deleted_by',
    allowNull: true,
  },
  deletedAt: {
    type: DataTypes.DATE, 
    field: 'deleted_at',
    allowNull: true,
  },
}, {
  tableName: 'sub_category',
  freezeTableName: true,
  timestamps: false,
});

module.exports = Subcategory;
