const { HTTP_STATUS_CODE } = require("../../../../config/constants");
const i18n = require("../../../../config/i18n");
const sequelize = require("../../../../config/sequelize");

const getAllCategories = async (req, res) => {
  try {
    const lang = i18n.getLocale() || "en";  
    let { page = 1, limit = 10, sortBy = "name", sortOrder = "asc" } = req.query;


    const validSortFields = ["name"];
    if (!validSortFields.includes(sortBy.toLowerCase())) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        msg: i18n.__("messages.INVALID_SORT_BY_FIELD"),
        data: "",
        err: null,
      });
    }

    page = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit;

    const query = `
      SELECT 
        c.id AS categoryId,
        ct.name AS categoryName, 
        ct.lang AS translationLang
      FROM category c
      LEFT JOIN category_trans ct 
        ON c.id = ct.category_id 
        AND ct.is_deleted = false 
        AND ct.lang = :lang
      WHERE c.is_deleted = false
      ORDER BY categoryName ${sortOrder}
      LIMIT :limit OFFSET :offset
    `;

    const categories = await sequelize.query(query, {
      replacements: { lang, limit, offset },
      type: sequelize.QueryTypes.SELECT,
      raw: true,
    });

    if (categories.length === 0) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
        msg: i18n.__("Category.CATEGORIES_NOT_FOUND"),
        data: "",
        err: null,
      });
    }

    const countQuery = `
      SELECT COUNT(*) AS totalCategories
      FROM category c
      WHERE c.is_deleted = false
    `;
    const countResult = await sequelize.query(countQuery, {
      type: sequelize.QueryTypes.SELECT,
      raw: true,
    });

    const totalCategories = countResult[0]?.totalCategories || 0;
    const totalPages = Math.ceil(totalCategories / limit);

    return res.status(HTTP_STATUS_CODE.OK).json({
      msg: i18n.__("Category.CATEGORIES_FETCHED"),
      data: categories,
      pagination: {
        totalCategories,
        totalPages,
        currentPage: page,
        limit,
      },
      err: null,
    });
  } catch (error) {
    console.error("Error in getting all categories:", error);
    return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
      msg: i18n.__("messages.INTERNAL_ERROR"),
      data: error.message,
      err: null,
    });
  }
};


module.exports = getAllCategories;
