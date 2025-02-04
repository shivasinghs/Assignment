const { SubCategory, SubCategoryTrans, Category,Account } = require("../../../models/index");
const { HTTP_STATUS_CODE, VALIDATOR,uuidv4 } = require("../../../../config/constants");
const i18n = require("../../../../config/i18n");
const sequelize = require("../../../../config/sequelize");
const { validationRules } = require("../../../../config/validationRules");

const createSubCategory = async (req, res) => {
  try {
    const { categoryId, translations } = req.body;
    const adminId = req.admin.id;

    const validation = new VALIDATOR(req.body, { 
      categoryId: validationRules.SubCategory.categoryId, 
      translations: validationRules.SubCategory.translations 
    });

    if (validation.fails()) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        status: HTTP_STATUS_CODE.BAD_REQUEST,
        message: i18n.__("messages.INVALID_INPUT"),
        data: "",
        err: validation.errors.all(),
      });
    }

    const category = await Category.findOne({
      where: { id: categoryId, isDeleted: false },
      attributes: ['id'],
    });

    if (!category) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
        status: HTTP_STATUS_CODE.NOT_FOUND,
        message: i18n.__("CATEGORY.NOT_FOUND"),
        data: "",
        err: null,
      });
    }

    await sequelize.transaction(async (transaction) => {

      for (let i = 0; i < translations.length; i++) {
        const query = `
          SELECT id
          FROM sub_category_trans
          WHERE is_deleted = false
          AND LOWER(name) = LOWER(:name)
        `;
    
        const existingTranslation = await sequelize.query(query, {
          replacements: { name: translations[i].name },
          type: sequelize.QueryTypes.SELECT,
          raw: true,
          transaction: transaction ,
        });
    
        if (existingTranslation.length > 0) {
          return res.status(HTTP_STATUS_CODE.CONFLICT).json({
            status: HTTP_STATUS_CODE.CONFLICT,
            message: i18n.__("SUBCATEGORY.TRANSLATIONS_EXISTS"),
            data: "",
            err: null,
          });
        }
      }

      const newSubCategory = await SubCategory.create({
        id: uuidv4(),
        categoryId,
        isActive: true,
        createdAt: Math.floor(Date.now() / 1000),
        createdBy: adminId,
      }, { transaction : transaction });

      const translationsData = [];
      for (let i = 0; i < translations.length; i++) {
        translationsData.push({
          id: uuidv4(),
          name: translations[i].name,
          lang: translations[i].lang,
          subcategoryId: newSubCategory.id,
          createdAt: Math.floor(Date.now() / 1000),
          createdBy: adminId,
        });
      }

      await SubCategoryTrans.bulkCreate(translationsData, { transaction: transaction });

      return res.status(HTTP_STATUS_CODE.CREATED).json({
        status: HTTP_STATUS_CODE.CREATED,
        message: i18n.__("SUBCATEGORY.CREATED"),
        data: { subCategoryId: newSubCategory.id },
        err: null,
      });
    });
  } catch (error) {
    console.error("Error in creating subcategory:", error);
    return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
      status: HTTP_STATUS_CODE.SERVER_ERROR,
      message: i18n.__("messages.INTERNAL_ERROR"),
      data: "",
      err: error.message,
    });
  }
};

const getSubCategoryById = async (req, res) => {
  try {
    const { subCategoryId } = req.params;

    const validation = new VALIDATOR(req.params, { subCategoryId: validationRules.SubCategory.subCategoryId });
    if (validation.fails()) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        status: HTTP_STATUS_CODE.BAD_REQUEST,
        message: i18n.__("messages.INVALID_INPUT"),
        data: "",
        err: validation.errors.all(),
      });
    }

    const query = `
      SELECT sc.id AS subCategoryId, sct.id AS subCategoryTransId,sct.name
      FROM sub_category sc
      LEFT JOIN sub_category_trans sct ON sct.subcategory_id = sc.id AND sct.is_deleted = false
      WHERE sc.id = :subCategoryId AND sc.is_deleted = false
    `;

    const subCategory = await sequelize.query(query, {
      replacements: { subCategoryId },
      type: sequelize.QueryTypes.SELECT,
      raw: true,
    });

    if (!subCategory || subCategory.length === 0) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
        status: HTTP_STATUS_CODE.NOT_FOUND,
        message: i18n.__("SUBCATEGORY.NOT_FOUND"),
        data: "",
        err: null,
      });
    }

    return res.status(HTTP_STATUS_CODE.OK).json({
      status: HTTP_STATUS_CODE.OK,
      message: i18n.__("SUBCATEGORY.FETCHED"),
      data: subCategory,
      err: null,
    });
  } catch (error) {
    console.error("Error in getting subcategory:", error);
    return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
      status: HTTP_STATUS_CODE.SERVER_ERROR,
      message: i18n.__("messages.INTERNAL_ERROR"),
      data: "",
      err: error.message,
    });
  }
};

const updateSubCategory = async (req, res) => {
  try {
    const { subCategoryId, translations } = req.body;
    const adminId = req.admin.id;

    const validation = new VALIDATOR(req.body, { 
      subCategoryId: validationRules.SubCategory.subCategoryId, 
      translations: validationRules.SubCategory.translations 
    });

    if (validation.fails()) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        status: HTTP_STATUS_CODE.BAD_REQUEST,
        message: i18n.__("messages.INVALID_INPUT"),
        data: "",
        err: validation.errors.all(),
      });
    }

    const subCategory = await SubCategory.findOne({
      where: { id: subCategoryId, isDeleted: false },
      attributes: ['id'],
    });

    if (!subCategory) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
        status: HTTP_STATUS_CODE.NOT_FOUND,
        message: i18n.__("SUBCATEGORY.NOT_FOUND"),
        data: "",
        err: null,
      });
    }

    await sequelize.transaction(async (transaction) => {

      for (let i = 0; i < translations.length; i++) {
        const query = `
          SELECT id
          FROM sub_category_trans
          WHERE is_deleted = false
          AND subcategory_id != :subCategoryId
          AND LOWER(name) = LOWER(:name)
        `;
    
        const existingTranslation = await sequelize.query(query, {
          replacements: {name: translations[i].name, subCategoryId },
          type: sequelize.QueryTypes.SELECT,
          raw: true,
          transaction: transaction ,
        });
    
        if (existingTranslation.length > 0) {
          return res.status(HTTP_STATUS_CODE.CONFLICT).json({
            status: HTTP_STATUS_CODE.CONFLICT,
            message: i18n.__("SUBCATEGORY.TRANSLATIONS_EXISTS_ASSOCIATED_TO_ANOTHER_SUBCATEGORY"),
            data: "",
            err: null,
          });
        }
      }
    
      const translationsData = [];
      for (let i = 0; i < translations.length; i++) {
        translationsData.push({
          id: uuidv4(),
          name: translations[i].name,
          lang: translations[i].lang,
          subcategoryId: subCategory.id,
          createdBy: adminId,
          createdAt: Math.floor(Date.now() / 1000),
        });
      }
   
      subCategory.updatedAt = Math.floor(Date.now() / 1000);
      subCategory.updatedBy = adminId;
      await subCategory.save({ transaction : transaction });

      await SubCategoryTrans.update(
        { isDeleted: true, deletedAt: Math.floor(Date.now() / 1000), deletedBy: adminId },
        { where: { subcategoryId: subCategoryId, isDeleted: false }, transaction: transaction }
      );

      await SubCategoryTrans.bulkCreate(translationsData, { transaction : transaction });

      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        message: i18n.__("SUBCATEGORY.UPDATED"),
        data: subCategory,
        err: null,
      });
    });
  } catch (error) {
    console.error("Error in updating subcategory:", error);
    return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
      status: HTTP_STATUS_CODE.SERVER_ERROR,
      message: i18n.__("messages.INTERNAL_ERROR"),
      data: "",
      err: error.message,
    });
  }
};

const deleteSubCategory = async (req, res) => {
  try {
    const { subCategoryId } = req.params;
    const adminId = req.admin.id;

    const validation = new VALIDATOR(req.params, { subCategoryId: validationRules.SubCategory.subCategoryId });
    if (validation.fails()) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        status: HTTP_STATUS_CODE.BAD_REQUEST,
        message: i18n.__("messages.INVALID_INPUT"),
        data: "",
        err: validation.errors.all(),
      });
    }

    const subCategory = await SubCategory.findOne({
      where: { id: subCategoryId, isDeleted: false },
      attributes: ['id'],
    });

    if (!subCategory) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
        status: HTTP_STATUS_CODE.NOT_FOUND,
        message: i18n.__("SUBCATEGORY.NOT_FOUND"),
        data: "",
        err: null,
      });
    }

    const accountsWithSubCategory = await Account.count({
      where: {
        subCategoryId: subCategoryId,
        isDeleted: false,
      }
    });

    if (accountsWithSubCategory > 0) {
      return res.status(HTTP_STATUS_CODE.FORBIDDEN).json({
        status: HTTP_STATUS_CODE.FORBIDDEN,
        message: i18n.__("SUBCATEGORY.ASSIGNED_TO_ACCOUNT"),
        data: "",
        err: null,
      });
    }

    await sequelize.transaction(async (transaction) => {
      
      await SubCategoryTrans.update(
        { isDeleted: true, deletedAt: Math.floor(Date.now() / 1000), deletedBy: adminId },
        { where: { subcategoryId: subCategoryId, isDeleted: false }, transaction: transaction }
      );

      await SubCategory.update(
        { isDeleted: true, deletedAt: Math.floor(Date.now() / 1000), deletedBy: adminId },
        { where: { id: subCategoryId, isDeleted: false }, transaction: transaction }
      );

    return res.status(HTTP_STATUS_CODE.OK).json({
      status: HTTP_STATUS_CODE.OK,
      message: i18n.__("SUBCATEGORY.DELETED"),
      data: subCategory,
      err: null,
    });
  });
  } catch (error) {
    console.error("Error in deleting subcategory:", error);
    return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
      status: HTTP_STATUS_CODE.SERVER_ERROR,
      message: i18n.__("messages.INTERNAL_ERROR"),
      data: error.message,
      err: error,
    });
  }
};


const getAllSubCategory = async (req, res) => {
  try {
    const lang = i18n.getLocale() || 'en';
    
    const query = `
      SELECT 
        sc.id AS subcategoryId,
        sct.id AS subcategoryTransId,
        sct.name,
        sct.lang
      FROM sub_category sc
      LEFT JOIN sub_category_trans sct 
        ON sct.subcategory_id = sc.id 
        AND sct.lang = :lang
      WHERE sc.is_deleted = false
      GROUP BY sc.id, sct.id, sct.name, sct.lang
      ORDER BY sc.created_at ASC `;

    const subcategories = await sequelize.query(query, {
      replacements: { lang },
      type: sequelize.QueryTypes.SELECT,
      raw: true
    });

    if (!subcategories || subcategories.length === 0) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
        status: HTTP_STATUS_CODE.NOT_FOUND,
        message: i18n.__("SUBCATEGORY.NOT_FOUND"),
        data: "",
        err: null
      });
    }

    const countQuery = `
      SELECT COUNT(*) as totalsubcategories
      FROM sub_category sc
      WHERE sc.is_deleted = false
    `;
    const countResult = await sequelize.query(countQuery, {
      type: sequelize.QueryTypes.SELECT,
      raw: true
    });
    console.log(countResult)
    const totalSubCategories = countResult[0]?.totasubcategories || 0;

    return res.status(HTTP_STATUS_CODE.OK).json({
      status: HTTP_STATUS_CODE.OK,
      message: i18n.__("SubCategory.SUBCATEGORY_FETCHED"),
      data: subcategories,
      totalSubCategories,
      err: null
    });
  } catch (error) {
    console.error("Error in getting subcategories:", error);
    return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
      status: HTTP_STATUS_CODE.SERVER_ERROR,
      message: i18n.__("messages.INTERNAL_ERROR"),
      data: error.message,
      err: null,
    });
  }
};



module.exports = {
  createSubCategory,
  getSubCategoryById,
  getAllSubCategory,
  updateSubCategory,
  deleteSubCategory
};