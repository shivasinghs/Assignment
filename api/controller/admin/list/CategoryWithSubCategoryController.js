const { HTTP_STATUS_CODE } = require("../../../../config/constants")
const i18n = require("../../../../config/i18n")
const sequelize = require("../../../../config/sequelize")

const listCategoriesWithSubcategories = async (req, res) => {
  try {
    const lang = i18n.getLocale() || "en"
    let { page = 1, limit = 10, sortBy = "name", sortOrder = "asc" } = req.query

    const validSortFields = ["name"]
    if (!validSortFields.includes(sortBy.toLowerCase())) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        msg: i18n.__("messages.INVALID_SORT_BY_FIELD"),
        data: "",
        err: null
      })
    }

    page = parseInt(page)
    limit = parseInt(limit)
    const offset = (page - 1) * limit

    const query = `
    SELECT 
      c.id AS categoryId,
      ct.name AS categoryName,
      ct.id AS categoryTransId,
      ct.lang AS categoryTransLang,
      sc.id AS subCategoryId,
      sct.name AS subCategoryName,
      sct.id AS subCategoryTransId,
      sct.lang AS subCategoryTransLang
    FROM category c
    LEFT JOIN category_trans ct 
      ON c.id = ct.category_id
      AND ct.lang = :lang 
      AND ct.is_deleted = false
    LEFT JOIN sub_category sc 
      ON c.id = sc.category_id
      AND sc.is_deleted = false
    LEFT JOIN sub_category_trans sct 
      ON sc.id = sct.subcategory_id
      AND sct.is_deleted = false
      AND sct.lang = :lang
    WHERE c.is_deleted = false
    ORDER BY ct.name ${sortOrder}, sct.name ${sortOrder} 
    LIMIT :limit OFFSET :offset
  `;
  

    const categorywithsubcategory = await sequelize.query(query, {
      replacements: { lang, limit, offset },
      type: sequelize.QueryTypes.SELECT,
      raw: true
    })

    if (categorywithsubcategory.length === 0) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
        msg: i18n.__("Category.CATEGORY_WITH_SUBCATEGORIES_NOT_FOUND"),
        data: "",
        err: null
      })
    }

    const countQuery = `
    SELECT COUNT(DISTINCT c.id) AS total
    FROM category c
    LEFT JOIN category_trans ct 
      ON c.id = ct.category_id
      AND ct.lang = $1 
      AND ct.is_deleted = false
    LEFT JOIN sub_category sc 
      ON c.id = sc.category_id
      AND sc.is_deleted = false
    LEFT JOIN sub_category_trans sct 
      ON sc.id = sct.subcategory_id
      AND sct.is_deleted = false
      AND sct.lang = $1  
    WHERE c.is_deleted = false
  `;
  
  const countResult = await sequelize.query(countQuery, {
    bind: [lang],  
    type: sequelize.QueryTypes.SELECT,
    raw: true
  });

    const totalCount = countResult[0]?.total || 0
    const totalPages = Math.ceil(totalCount / limit)

    return res.status(HTTP_STATUS_CODE.OK).json({
      msg: i18n.__("Category.CATEGORY_WITH_SUBCATEGORIES_FETCHED"),
      data: categorywithsubcategory,
      pagination: {
        totalCount,
        totalPages,
        currentPage: page,
        pageSize: limit
      },
      err: null
    })
  } catch (error) {
    console.error("Error in getting categories with subcategories:", error)
    return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
      msg: i18n.__("messages.INTERNAL_ERROR"),
      data: error.message,
      err: null
    })
  }
}

module.exports = listCategoriesWithSubcategories
