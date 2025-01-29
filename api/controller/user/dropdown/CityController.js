const { HTTP_STATUS_CODE } = require("../../../../config/constants");
const i18n = require("../../../../config/i18n");
const sequelize = require("../../../../config/sequelize");

const getAllCity = async (req, res) => {
    try {
        const lang = i18n.getLocale() || 'en';
        const { page = 1, limit = 10, sortBy = 'name', sortOrder = 'asc' } = req.query;

        const validSortFields = ['name'];
        if (!validSortFields.includes(sortBy.toLowerCase())) {
            return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
                msg: i18n.__("messages.INVALID_SORT_BY_FIELD"),
                data: "",
                err: null,
            });
        }

        const offset = (page - 1) * limit;

        const query = `
            SELECT c.id, ct.*
            FROM mst_city c
            LEFT JOIN mst_city_trans ct ON ct.city_id = c.id  AND ct.lang = :lang
            WHERE c.is_deleted = false
            ORDER BY ct.${sortBy} ${sortOrder}
            LIMIT :limit OFFSET :offset
        `;

        const cities = await sequelize.query(query, {
            replacements: { limit: parseInt(limit), offset: parseInt(offset),lang },
            type: sequelize.QueryTypes.SELECT,
            raw: true
        });

        if (!cities || cities.length === 0) {
            return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
                msg: i18n.__("City.CITY_NOT_FOUND"),
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

        const totalCities = countResult[0]?.totalCities || 0;
        const totalPages = Math.ceil(totalCities / limit);

        return res.status(HTTP_STATUS_CODE.OK).json({
            msg: i18n.__("City.CITY_FETCHED"),
            data: cities,
            pagination: {
                totalCities,
                totalPages,
                currentPage: page,
                limit
            },
            err: null
        });
    } catch (error) {
        console.error("Error in getting cities:", error);
        return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
            msg: i18n.__("messages.INTERNAL_ERROR"),
            data: error.message,
            err: null,
        });
    }
};

module.exports = getAllCity;
