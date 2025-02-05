const { MstCity, MstCityTrans } = require("../../../models/index");
const { HTTP_STATUS_CODE, VALIDATOR, uuidv4 } = require("../../../../config/constants");
const i18n = require("../../../../config/i18n");
const { validationRules } = require("../../../../config/validationRules");
const sequelize = require("../../../../config/sequelize");

const createCity = async (req, res) => {
  try {
    const { countryId, translations } = req.body;
    const adminId = req.admin.id;

    const validation = new VALIDATOR(req.body, 
      { 
        countryId: validationRules.City.countryId, 
        translations: validationRules.City.translations
     });
    if (validation.fails()) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        status: HTTP_STATUS_CODE.BAD_REQUEST,
        message: i18n.__("messages.INVALID_INPUT"),
        data: validation.errors.all(),
        err: null,
      });
    }

    for (let i = 0; i < translations.length; i++) {
      const query = `
        SELECT id 
        FROM mst_city_trans
        WHERE is_deleted = false
        AND lang = '${translations[i].lang}'
        AND LOWER(name) = LOWER(:name)
      `;
      const existingTranslation = await sequelize.query(query, {
        replacements: { name: translations[i].name },
        type: sequelize.QueryTypes.SELECT,
        raw: true,
      });

      if (existingTranslation.length > 0) {
        return res.status(HTTP_STATUS_CODE.CONFLICT).json({
          status: HTTP_STATUS_CODE.CONFLICT,
          message: i18n.__("CITY.TRANSLATIONS_EXISTS"),
          data: "",
          err: null,
        });
      }
    }
    
    const cityId = uuidv4();

    const translationsData = [];
    for (let i = 0; i < translations.length; i++) {
      translationsData.push({
        id: uuidv4(),
        name: translations[i].name,
        lang: translations[i].lang,
        cityId,
        createdAt: Math.floor(Date.now() / 1000),
        createdBy: adminId,
      });
    }

    await sequelize.transaction(async (transaction) => {

    await MstCity.create({
      id: cityId,
      countryId,
      isActive: true,
      createdAt: Math.floor(Date.now() / 1000),
      createdBy: adminId,
    },{transaction});

    await MstCityTrans.bulkCreate(translationsData,{transaction});
  })

    return res.status(HTTP_STATUS_CODE.CREATED).json({
      status: HTTP_STATUS_CODE.CREATED,
      message: i18n.__("CITY.CREATED"),
      data: { cityId},
      err: null,
    });
  } catch (error) {
    console.error("Error in creating city:", error);
    return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
      status: HTTP_STATUS_CODE.SERVER_ERROR,
      message: i18n.__("messages.INTERNAL_ERROR"),
      data: error.message,
      err: null,
    });
  }
};

const getCityById = async (req, res) => {
  try {
    const { cityId } = req.params;

    const validation = new VALIDATOR(req.params, { cityId: validationRules.City.cityId, });
    if (validation.fails()) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        status: HTTP_STATUS_CODE.BAD_REQUEST,
        message: i18n.__("messages.INVALID_INPUT"),
        data: "",
        err: validation.errors.all(),
      });
    }

    const query = `
      SELECT c.id AS cityId,ct.id AS cityTransId,ct.name,ct.lang
      FROM mst_city c
      LEFT JOIN mst_city_trans ct ON ct.city_id = c.id AND ct.is_deleted = false
      WHERE c.id = :cityId AND c.is_deleted = false
    `;

    const city = await sequelize.query(query, {
      replacements: { cityId },
      type: sequelize.QueryTypes.SELECT,
      raw: true,
    });

    if (!city || city.length === 0) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
        status: HTTP_STATUS_CODE.NOT_FOUND,
        message: i18n.__("CITY.NOT_FOUND"),
        data: "",
        err: null,
      });
    }

    return res.status(HTTP_STATUS_CODE.OK).json({
      status: HTTP_STATUS_CODE.OK,
      message: i18n.__("CITY.FETCHED"),
      data: city,
      err: null,
    });
  } catch (error) {
    console.error("Error in getting city:", error);
    return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
      status: HTTP_STATUS_CODE.SERVER_ERROR,
      message: i18n.__("messages.INTERNAL_ERROR"),
      data: error.message,
      err: null,
    });
  }
};

const updateCity = async (req, res) => {
  try {
    const { cityId, translations } = req.body;
    const adminId = req.admin.id;

    const validation = new VALIDATOR(req.body, 
      { 
        cityId: validationRules.City.cityId,
        translations: validationRules.City.translations
       }
    );
    if (validation.fails()) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        status: HTTP_STATUS_CODE.BAD_REQUEST,
        message: i18n.__("messages.INVALID_INPUT"),
        data: "",
        err: validation.errors.all(),
      });
    }

    const city = await MstCity.findOne({
      where: { id: cityId, isDeleted: false },
      attributes: ['id'],
    });

    if (!city) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
        status: HTTP_STATUS_CODE.NOT_FOUND,
        message: i18n.__("CITY.NOT_FOUND"),
        data: "",
        err: null,
      });
    }

    for (let i = 0; i < translations.length; i++) {
      const query = `
        SELECT id 
        FROM mst_city_trans
        WHERE is_deleted = false
        AND city_id != :cityId
        AND lang = '${translations[i].lang}' 
        AND LOWER(name) = LOWER(:name)
      `;
      const existingTranslation = await sequelize.query(query, {
        replacements: { name: translations[i].name, cityId },
        type: sequelize.QueryTypes.SELECT,
        raw: true,
      });

      if (existingTranslation.length > 0) {
        return res.status(HTTP_STATUS_CODE.CONFLICT).json({
          status: HTTP_STATUS_CODE.CONFLICT,
          message: i18n.__("CITY.TRANSLATIONS_EXISTS_ASSOCIATED_TO_ANOTHER_CITY"),
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
        cityId: cityId,
        createdBy: adminId,
        createdAt: Math.floor(Date.now() / 1000),
      });
    }

    await sequelize.transaction(async (transaction) => {

    city.updatedAt = Math.floor(Date.now() / 1000);
    city.updatedBy = adminId;
    await city.save({transaction});

    await MstCityTrans.update(
      { isDeleted: true, deletedAt: Math.floor(Date.now() / 1000), deletedBy: adminId },
      { where: { cityId: cityId, isDeleted: false }, transaction }
    );

    await MstCityTrans.bulkCreate(translationsData, {transaction});
  })

    return res.status(HTTP_STATUS_CODE.OK).json({
      status: HTTP_STATUS_CODE.OK,
      message: i18n.__("CITY.UPDATED"),
      data: city,
      err: null,
    });
  } catch (error) {
    console.error("Error in updating city:", error);
    return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
      status: HTTP_STATUS_CODE.SERVER_ERROR,
      message: i18n.__("messages.INTERNAL_ERROR"),
      data: error.message,
      err: null,
    });
  }
};

const deleteCity = async (req, res) => {
  try {
    const { cityId } = req.params;
    const adminId = req.admin.id;

    const validation = new VALIDATOR(req.params, { cityId: validationRules.City.cityId });
    if (validation.fails()) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        status: HTTP_STATUS_CODE.BAD_REQUEST,
        message: i18n.__("messages.INVALID_INPUT"),
        data: "",
        err: validation.errors.all(),
      });
    }

    const city = await MstCity.findOne({
      where: { id: cityId, isDeleted: false },
      attributes: ['id'],
    });

    if (!city) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
        status: HTTP_STATUS_CODE.NOT_FOUND,
        message: i18n.__("CITY.NOT_FOUND"),
        data: "",
        err: null,
      });
    }

    await sequelize.transaction(async (transaction) => {

    await MstCityTrans.update(
      { isDeleted: true, deletedAt: Math.floor(Date.now() / 1000), deletedBy: adminId },
      { where: { cityId: cityId, isDeleted: false } ,transaction}
    );

    await MstCity.update(
      { isDeleted: true, deletedAt: Math.floor(Date.now() / 1000), deletedBy: adminId },
      { where: { id: cityId, isDeleted: false }, transaction }
    );
  })

    return res.status(HTTP_STATUS_CODE.OK).json({
      status: HTTP_STATUS_CODE.OK,
      message: i18n.__("CITY.DELETED"),
      data: city,
      err: null,
    });
  } catch (error) {
    console.error("Error in deleting city:", error);
    return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
      status: HTTP_STATUS_CODE.SERVER_ERROR,
      message: i18n.__("messages.INTERNAL_ERROR"),
      data: error.message,
      err: null,
    });
  }
};

const getAllCity = async (req, res) => {
  try {
    const lang = i18n.getLocale() || 'en';
    const page = 1;
    const pageSize = 10;
    const offset = (page - 1) * pageSize;

    const query = `
      SELECT 
        c.id AS cityId,
        ct.id AS cityTransId,
        ct.name AS cityName, 
        ct.lang AS translationLang
      FROM mst_city c
      LEFT JOIN mst_city_trans ct ON ct.city_id = c.id 
      AND ct.lang = :lang AND ct.is_deleted = false
      WHERE c.is_deleted = false
      ORDER BY c.created_at asc
      LIMIT :limit OFFSET :offset
    `;

    const cities = await sequelize.query(query, {
      replacements: { lang, limit: pageSize, offset },
      type: sequelize.QueryTypes.SELECT,
      raw: true
    });

    if (!cities || cities.length === 0) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
        status: HTTP_STATUS_CODE.NOT_FOUND,
        message: i18n.__("CITY.NOT_FOUND"),
        data: "",
        err: null
      });
    }

    const countQuery = `
      SELECT COUNT(*) as totalCities
      FROM mst_city c
      WHERE c.is_deleted = false
    `;
    const countResult = await sequelize.query(countQuery, {
      type: sequelize.QueryTypes.SELECT,
      raw: true
    });

    const totalCities = countResult[0]?.totalcities || 0;

    return res.status(HTTP_STATUS_CODE.OK).json({
      status: HTTP_STATUS_CODE.OK,
      message: i18n.__("CITYFETCHED"),
      data: cities,
      total:totalCities,
      err: null
    });
  } catch (error) {
    console.error("Error in getting cities:", error);
    return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
      status: HTTP_STATUS_CODE.SERVER_ERROR,
      message: i18n.__("messages.INTERNAL_ERROR"),
      data: error.message,
      err: null
    });
  }
};

module.exports = {
  createCity,
  getCityById,
  getAllCity,
  updateCity,
  deleteCity,
};