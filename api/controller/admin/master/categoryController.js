const { Op, HTTP_STATUS_CODE, uuidv4 } = require("../../../../config/constants")
const Category = require("../../../models/Category")
const i18n = require("../../../../config/i18n")

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


const getCategoriesWithSubcategories = async (req, res) => {
  const { search } = req.query;

  try {
    // Build the search filter
    const categoryFilter = {
      isDeleted: false,
    };

    if (search) {
      categoryFilter.name = {
        [Op.like]: `%${search}%`,
      };
    }

    // Fetch categories and include subcategories
    const categories = await Category.findAll({
      where: categoryFilter,
      include: [
        {
          model: SubCategory,
          as: "subcategories",
          where: { isDeleted: false },
          required: false, // Include categories even if they don't have subcategories
        },
      ],
    });

    if (categories.length === 0) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
        message: i18n.__("messages.NO_RESOURCES_FOUND"),
      });
    }

    return res.status(HTTP_STATUS_CODE.OK).json({
      message: i18n.__("messages.RESOURCE_FETCHED_SUCCESSFULLY"),
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching categories with subcategories:", error);
    return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
      message: i18n.__("messages.INTERNAL_ERROR"),
    });
  }
};

module.exports = {
  createCategory,
  getCategoriesWithSubcategories,
};



