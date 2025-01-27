const { Category, CategoryTrans, SubCategory, SubCategoryTrans } = require("../../../models/index");
const { HTTP_STATUS_CODE, Op } = require("../../../../config/constants");
const i18n = require("../../../../config/i18n");

const listCategoriesWithSubcategories = async (req, res) => {
  try {
    const { search = "" } = req.query;

    const categories = await Category.findAll({
      include: [
        {
          model: CategoryTrans,
          as: "translations", 
          where: {
            name: {
              [Op.like]: `%${search}%`, 
            },
          },
          attributes: ["id", "name", "lang"],
        },
        {
          model: SubCategory,
          as: "subcategories", 
          attributes: ["id", "isActive"],
          include: [
            {
              model: SubCategoryTrans,
              as: "translations", 
              attributes: ["id", "name", "lang"],
            },
          ],
        },
      ],
      attributes: ["id"], 
      order: [["id", "ASC"]],
    });
    const formattedCategories = categories.map((category) => ({
      id: category.id,
      translations: category.translations.map((translation) => ({
        id: translation.id,
        name: translation.name,
        lang: translation.lang,
      })),
      subcategories: category.subcategories.map((subcategory) => ({
        id: subcategory.id,
        isActive: subcategory.isActive,
        translations: subcategory.translations.map((translation) => ({
          id: translation.id,
          name: translation.name,
          lang: translation.lang,
        })),
      })),
    }));

    return res.status(HTTP_STATUS_CODE.OK).json({
      msg: i18n.__("messages.CATEGORIES_LISTED"),
      data: {
        categories: formattedCategories,
      },
      err: null,
    });
  } catch (error) {
    return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
      msg: i18n.__("messages.INTERNAL_ERROR"),
      data: "",
      err: error.message,
    });
  }
};

module.exports = { listCategoriesWithSubcategories };
