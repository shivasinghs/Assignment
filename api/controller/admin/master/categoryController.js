const { Category, CategoryTrans, Account } = require("../../../models/index")
const {HTTP_STATUS_CODE, VALIDATOR, uuidv4} = require("../../../../config/constants")
const i18n = require("../../../../config/i18n")
const { validationRules } = require("../../../../config/validationRules")
const sequelize = require("../../../../config/sequelize")

const createCategory = async (req, res) => {
  try {
    const { translations } = req.body
    const adminId = req.admin.id

    const validation = new VALIDATOR(req.body, {
      translations: validationRules.Category.translations
    })

    if (validation.fails()) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        status: HTTP_STATUS_CODE.BAD_REQUEST,
        message: i18n.__("messages.INVALID_INPUT"),
        data: "",
        err: validation.errors.all()
      })
    }

    for (let i = 0; i < translations.length; i++) {
      const query = `
      SELECT id
      FROM category_trans
      WHERE is_deleted = false
      AND lang = '${translations[i].lang}'
      AND LOWER(name) = LOWER(:name)
    `

      const existingTranslation = await sequelize.query(query, {
        replacements: {
          name: translations[i].name
        },
        type: sequelize.QueryTypes.SELECT,
        raw: true
      })

      if (existingTranslation.length > 0) {
        return res.status(HTTP_STATUS_CODE.CONFLICT).json({
          status: HTTP_STATUS_CODE.CONFLICT,
          message: i18n.__("CATEGORY.TRANSLATIONS_EXISTS"),
          data: "",
          err: null
        })
      }
    }

    const categoryId = uuidv4();

    const translationsData = []
    for (let i = 0; i < translations.length; i++) {
      translationsData.push({
        id: uuidv4(),
        name: translations[i].name,
        lang: translations[i].lang,
        categoryId,
        createdAt: Math.floor(Date.now() / 1000),
        createdBy: adminId
      })
    }

    await sequelize.transaction(async (transaction) => {

    await Category.create({
      id: categoryId,
      isActive: true,
      createdAt: Math.floor(Date.now() / 1000),
      createdBy: adminId
    },{transaction})

    await CategoryTrans.bulkCreate(translationsData,{transaction})
  })

    return res.status(HTTP_STATUS_CODE.CREATED).json({
      status: HTTP_STATUS_CODE.CREATED,
      message: i18n.__("CATEGORY.CREATED"),
      data: { categoryId },
      err: null
    })
  } catch (error) {
    console.error("Error in creating category:", error)
    return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
      status: HTTP_STATUS_CODE.SERVER_ERROR,
      message: i18n.__("messages.INTERNAL_ERROR"),
      data: "",
      err: error.message
    })
  }
}

const getCategoryById = async (req, res) => {
  try {
    const { categoryId } = req.params

    const validation = new VALIDATOR(req.params, {
      categoryId: validationRules.Category.categoryId
    })
    if (validation.fails()) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        status : HTTP_STATUS_CODE.BAD_REQUEST,
        message: i18n.__("messages.INVALID_INPUT"),
        data: "",
        err: validation.errors.all()
      })
    }
    

    const query = `
      SELECT c.id AS categoryId, ct.id AS categorytransId ,ct.name
      FROM category c
      LEFT JOIN category_trans ct ON ct.category_id = c.id
      WHERE c.id = :categoryId AND ct.is_deleted = false
    `

    const category = await sequelize.query(query, {
      replacements: { categoryId },
      type: sequelize.QueryTypes.SELECT,
      raw: true
    })

    if (!category || category.length === 0) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
        status : HTTP_STATUS_CODE.NOT_FOUND,
        message: i18n.__("CATEGORY.NOT_FOUND"),
        data: "",
        err: null
      })
    }

    return res.status(HTTP_STATUS_CODE.OK).json({
      status : HTTP_STATUS_CODE.OK,
      message: i18n.__("CATEGORY.FETCHED"),
      data: category,
      err: null
    })
  } catch (error) {
    console.error("Error in getting category:", error)
    return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
      status : HTTP_STATUS_CODE.SERVER_ERROR,
      message: i18n.__("messages.INTERNAL_ERROR"),
      data: error.message,
      err: error
    })
  }
}

const updateCategory = async (req, res) => {
  try {
    const { categoryId, translations } = req.body
    const adminId = req.admin.id

    const validation = new VALIDATOR(req.body, validationRules.Category)
    if (validation.fails()) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        status: HTTP_STATUS_CODE.BAD_REQUEST,
        message: i18n.__("messages.INVALID_INPUT"),
        data: "",
        err: validation.errors.all()
      })
    }

    const category = await Category.findOne({
      where: { id: categoryId, isDeleted: false },
      attributes: ["id"]
    })

    if (!category) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
        status: HTTP_STATUS_CODE.NOT_FOUND,
        message: i18n.__("CATEGORY.NOT_FOUND"),
        data: "",
        err: null
      })
    }

    for (let i = 0; i < translations.length; i++) {
      const query = `
      SELECT id
      FROM category_trans
      WHERE is_deleted = false
      AND category_id != :categoryId
      AND lang = '${translations[i].lang}'
      AND LOWER(name) = LOWER(:name)
  `

      const existingTranslation = await sequelize.query(query, {
        replacements: {
          name: translations[i].name,
          categoryId
        },
        type: sequelize.QueryTypes.SELECT,
        raw: true
      })

      if (existingTranslation.length > 0) {
        return res.status(HTTP_STATUS_CODE.CONFLICT).json({
          status: HTTP_STATUS_CODE.CONFLICT,
          message: i18n.__(
              "CATEGORY.TRANSLATIONS_EXISTS_ASSOCIATED_TO_ANOTHER_CATEGORY"
            ),
          data: "",
          err: null
        })
      }
    }

    const translationsData = []
    for (let i = 0; i < translations.length; i++) {
      translationsData.push({
        id: uuidv4(),
        name: translations[i].name,
        lang: translations[i].lang,
        categoryId,
        createdBy: adminId,
        createdAt: Math.floor(Date.now() / 1000)
      })
    }

    await sequelize.transaction(async (transaction) => {

    category.updatedAt = Math.floor(Date.now() / 1000)
    category.updatedBy = adminId
    await category.save({transaction})

    await CategoryTrans.update(
      {
        isDeleted: true,
        deletedAt: Math.floor(Date.now() / 1000),
        deletedBy: adminId
      },
      { where: { categoryId: categoryId, isDeleted: false } , transaction}
    )

    await CategoryTrans.bulkCreate(translationsData, {transaction})
  })

    return res.status(HTTP_STATUS_CODE.OK).json({
      status: HTTP_STATUS_CODE.OK,
      message: i18n.__("CATEGORY.UPDATED"),
      data: categoryId,
      err: null
    })
  } catch (error) {
    console.error("Error in updating category:", error)
    return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
      status: HTTP_STATUS_CODE.SERVER_ERROR,
      message: i18n.__("messages.INTERNAL_ERROR"),
      data: error.message,
      err: ""
    })
  }
}

const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params
    const adminId = req.admin.id

    const validation = new VALIDATOR(req.params, {
      categoryId: validationRules.Category.categoryId
    })
    if (validation.fails()) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        status: HTTP_STATUS_CODE.BAD_REQUEST,
        message: i18n.__("messages.INVALID_INPUT"),
        data: "",
        err: validation.errors.all()
      })
    }

    const category = await Category.findOne({
      where: { id: categoryId, isDeleted: false },
      attributes: ["id"]
    })

    if (!category) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
        status: HTTP_STATUS_CODE.NOT_FOUND,
        message: i18n.__("CATEGORY.NOT_FOUND"),
        data: "",
        err: null
      })
    }

    const accountsWithCategory = await Account.count({
      where: {
        categoryId: categoryId,
        isDeleted: false
      },
      attributes: ["id"]
    })

    if (accountsWithCategory > 0) {
      return res.status(HTTP_STATUS_CODE.FORBIDDEN).json({
        status: HTTP_STATUS_CODE.FORBIDDEN,
        message: i18n.__("CATEGORY.ASSIGNED_TO_ACCOUNT"),
        data: "",
        err: null
      })
    }
    
    await sequelize.transaction(async (transaction) => {
    await CategoryTrans.update(
      {
        isDeleted: true,
        deletedAt: Math.floor(Date.now() / 1000),
        deletedBy: adminId
      },
      { where: { categoryId: categoryId, isDeleted: false }, transaction }
    )

    await Category.update(
      {
        isDeleted: true,
        deletedAt: Math.floor(Date.now() / 1000),
        deletedBy: adminId
      },
      { where: { id: categoryId, isDeleted: false } , transaction}
    )
  })
    return res.status(HTTP_STATUS_CODE.OK).json({
      status: HTTP_STATUS_CODE.OK,
      message: i18n.__("CATEGORY.DELETED"),
      data: category,
      err: null
    })
  } catch (error) {
    console.error("Error in deleting category:", error)
    return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
      status: HTTP_STATUS_CODE.SERVER_ERROR,
      message: i18n.__("messages.INTERNAL_ERROR"),
      data: error.message,
      err: ""
    })
  }
}

const getAllCategories = async (req, res) => {
  try {
    const lang = i18n.getLocale() || "en"
    const page = 1
    const pageSize = 10

    const offset = (page - 1) * pageSize

    const query = `
      SELECT 
        c.id AS categoryId,
        ct.id AS categoryTransId,
        ct.name AS categoryName, 
        ct.lang AS translationLang
      FROM category c
      LEFT JOIN category_trans ct 
        ON c.id = ct.category_id 
        AND ct.is_deleted = false 
        AND ct.lang = :lang
      WHERE c.is_deleted = false
      ORDER BY c.created_at ASC
      LIMIT :limit OFFSET :offset
    `

    const categories = await sequelize.query(query, {
      replacements: { lang, limit: pageSize, offset },
      type: sequelize.QueryTypes.SELECT,
      raw: true
    })

    if (categories.length === 0) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
        status : HTTP_STATUS_CODE.NOT_FOUND,
        message: i18n.__("CATEGORY.NOT_FOUND"),
        data: "",
        err: null
      })
    }

    const countQuery = `
    SELECT COUNT(*) AS totalCategories
    FROM category c
    WHERE c.is_deleted = false
  `
    const countResult = await sequelize.query(countQuery, {
      type: sequelize.QueryTypes.SELECT,
      raw: true
    })
    console.log(countResult)

    const totalCategories = Number(countResult[0]?.totalcategories) || 0

    return res.status(HTTP_STATUS_CODE.OK).json({
      status : HTTP_STATUS_CODE.OK,
      message: i18n.__("CATEGORY.CATEGORIES_FETCHED"),
      data: categories,
      total: totalCategories,
      err: null
    })
  } catch (error) {
    console.error("Error in getting all categories:", error)
    return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
      status : HTTP_STATUS_CODE.SERVER_ERROR,
      message: i18n.__("messages.INTERNAL_ERROR"),
      data: error.message,
      err: null
    })
  }
}

const listCategoriesWithSubcategories = async (req, res) => {
  try {
    const lang = i18n.getLocale() || "en"
    const page = req.query.page || 1
    const pageSize = 10
    const offset = (page - 1) * pageSize

    const query = `
    SELECT
      c.id AS categoryId,
      ct.id AS categoryTransId,
      ct.name AS categoryName,
      ct.lang AS translationLang,
      CASE 
        WHEN COUNT(sc.id) > 0 THEN 
          JSONB_AGG(
            JSONB_BUILD_OBJECT(
              'subCategoryId', sc.id,
              'subCategoryName', sct.name,
              'subCategoryTransId', sct.id,
              'subCategoryTransLang', sct.lang
            )
                  )
            ELSE '[]'::jsonb
          END AS subcategories_agg
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
        GROUP BY c.id, ct.id;`

    const categoriesWithSubcategories = await sequelize.query(query, {
      replacements: { lang, limit: pageSize, offset },
      type: sequelize.QueryTypes.SELECT,
      raw: true
    })

    if (categoriesWithSubcategories.length === 0) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
        status : HTTP_STATUS_CODE.NOT_FOUND,
        message: i18n.__("CATEGORY.CATEGORY_WITH_SUBCATEGORIES_NOT_FOUND"),
        data: "",
        err: null
      })
    }

    const countQuery = `
      SELECT COUNT(DISTINCT c.id) AS totalCategories
      FROM category c
      LEFT JOIN category_trans ct 
        ON c.id = ct.category_id
        AND ct.is_deleted = false
      LEFT JOIN sub_category sc 
        ON c.id = sc.category_id
        AND sc.is_deleted = false
      LEFT JOIN sub_category_trans sct 
        ON sc.id = sct.subcategory_id
        AND sct.is_deleted = false
      WHERE c.is_deleted = false
    `
    const countResult = await sequelize.query(countQuery, {
      type: sequelize.QueryTypes.SELECT,
      raw: true
    })

    const totalCategories = countResult[0]?.totalcategories

    return res.status(HTTP_STATUS_CODE.OK).json({
      status : HTTP_STATUS_CODE.OK,
      message: i18n.__("CATEGORY.CATEGORY_WITH_SUBCATEGORIES_FETCHED"),
      data: categoriesWithSubcategories,
      total: totalCategories,
      err: null
    })
  } catch (error) {
    console.error("Error in getting categories with subcategories:", error)
    return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
      status : HTTP_STATUS_CODE.SERVER_ERROR,
      message: i18n.__("messages.INTERNAL_ERROR"),
      data: error.message,
      err: error
    })
  }
}

module.exports = {
  createCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getAllCategories,
  listCategoriesWithSubcategories
}
