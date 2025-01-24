const { Op, HTTP_STATUS_CODE, uuidv4 } = require("../../config/constant")
const Category = require("../models/Category")
const i18n = require("../../config/i18n")

const createCategory = async (req, res) => {
  const { name } = req.body

  try {
    const existingCategory = await Category.findOne({ where: { name } })
    if (existingCategory) {
      return res.status(HTTP_STATUS_CODE.CONFLICT).json({
        message: i18n.__("messages.RESOURCE_ALREADY_EXISTS")
      })
    }

    const category = await Category.create({
      id: uuidv4(),
      name
    })

    return res.status(HTTP_STATUS_CODE.CREATED).json({
      message: i18n.__("messages.RESOURCE_CREATED_SUCCESSFULLY"),
      category
    })
  } catch (error) {
    console.error("Error creating category:", error)
    return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
      message: i18n.__("messages.INTERNAL_ERROR")
    })
  }
}

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { isDeleted: false }
    })

    if (categories.length === 0) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
        message: i18n.__("messages.NO_RESOURCES_FOUND")
      })
    }

    return res.status(HTTP_STATUS_CODE.OK).json({ categories })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
      message: i18n.__("messages.INTERNAL_ERROR")
    })
  }
}

const updateCategory = async (req, res) => {
  const { id } = req.params
  const { name } = req.body

  try {
    const category = await Category.findOne({ where: { id, isDeleted: false } })

    if (!category) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
        message: i18n.__("messages.RESOURCE_NOT_FOUND")
      })
    }

    await category.update({
      name: name || category.name,
      updatedAt: Math.floor(Date.now() / 1000)
    })

    return res.status(HTTP_STATUS_CODE.OK).json({
      message: i18n.__("messages.RESOURCE_UPDATED_SUCCESSFULLY"),
      category
    })
  } catch (error) {
    console.error("Error updating category:", error)
    return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
      message: i18n.__("messages.INTERNAL_ERROR")
    })
  }
}

const deleteCategory = async (req, res) => {
  const { id } = req.params

  try {
    const category = await Category.findOne({ where: { id, isDeleted: false } })

    if (!category) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
        message: i18n.__("messages.RESOURCE_NOT_FOUND")
      })
    }

    await category.update({
      isDeleted: true,
      deletedAt: new Date()
    })

    return res.status(HTTP_STATUS_CODE.OK).json({
      message: i18n.__("messages.RESOURCE_DELETED_SUCCESSFULLY")
    })
  } catch (error) {
    console.error("Error deleting category:", error)
    return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
      message: i18n.__("messages.INTERNAL_ERROR")
    })
  }
}

module.exports = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory
}
