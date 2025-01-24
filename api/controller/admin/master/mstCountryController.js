const { HTTP_STATUS_CODE } = require("../../../../config/constants");
const i18n = require("../../../../config/i18n");

const createCountry = async (req, res) => {
  const { name} = req.body;

  try {
    const existingCountry = await MstCountry.findOne({ where: { name } });
    if (existingCountry) {
      return res
        .status(HTTP_STATUS_CODE.CONFLICT)
        .json({ message: i18n.__("messages.RESOURCE_ALREADY_EXISTS") });
    }

    const country = await MstCountry.create({
      id: uuidv4(),
      name,
    });

    return res.status(HTTP_STATUS_CODE.CREATED).json({
      message: i18n.__("messages.RESOURCE_CREATED_SUCCESSFULLY"),
      country,
    });
  } catch (error) {
    console.error("Error creating country:", error);
    return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
      message: i18n.__("messages.INTERNAL_ERROR"),
    });
  }
};

const getAllCountries = async (req, res) => {
  try {
    const countries = await MstCountry.findAll({
      where: { isDeleted: false, isActive: true },
    });

    if (!countries.length) {
      return res
        .status(HTTP_STATUS_CODE.NOT_FOUND)
        .json({ message: i18n.__("messages.NO_RESOURCES_FOUND") });
    }

    return res.status(HTTP_STATUS_CODE.OK).json(countries);
  } catch (error) {
    console.error("Error fetching countries:", error);
    return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
      message: i18n.__("messages.INTERNAL_ERROR"),
    });
  }
};

const deleteCountry = async (req, res) => {
  const { id } = req.params;

  try {
    const country = await MstCountry.findByPk(id);
    if (!country) {
      return res
        .status(HTTP_STATUS_CODE.NOT_FOUND)
        .json({ message: i18n.__("messages.RESOURCE_NOT_FOUND") });
    }

    country.isDeleted = true;
    country.deletedAt = new Date();
    await country.save();

    return res.status(HTTP_STATUS_CODE.OK).json({
      message: i18n.__("messages.RESOURCE_DELETED_SUCCESSFULLY"),
    });
  } catch (error) {
    console.error("Error deleting country:", error);
    return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
      message: i18n.__("messages.INTERNAL_ERROR"),
    });
  }
};

module.exports = {
  createCountry,
  getAllCountries,
  deleteCountry,
};
