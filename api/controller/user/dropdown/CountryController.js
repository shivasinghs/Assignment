const { HTTP_STATUS_CODE } = require("../../../../config/constants");
const i18n = require("../../../../config/i18n");
const sequelize = require("../../../../config/sequelize");

const getAllCountry = async (req, res) => {
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
            FROM mst_country c
            LEFT JOIN mst_country_trans ct ON ct.country_id = c.id AND lang = :lang
            WHERE c.is_deleted = false
            ORDER BY ct.${sortBy} ${sortOrder}
            LIMIT :limit OFFSET :offset
        `;

        const countries = await sequelize.query(query, {
            replacements: { limit: parseInt(limit), offset: parseInt(offset),lang },
            type: sequelize.QueryTypes.SELECT,
            raw: true
        });

        if (!countries || countries.length === 0) {
            return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
                msg: i18n.__("Country.COUNTRY_NOT_FOUND"),
                data: "",
                err: null
            });
        }

        const countQuery = `
            SELECT COUNT(*) as totalCountries
            FROM mst_country c
            WHERE c.is_deleted = false
        `;
        const countResult = await sequelize.query(countQuery, {
            type: sequelize.QueryTypes.SELECT,
            raw: true
        });

        const totalCountries = countResult[0]?.totalCountries || 0;
        const totalPages = Math.ceil(totalCountries / limit);

        return res.status(HTTP_STATUS_CODE.OK).json({
            msg: i18n.__("Country.COUNTRY_FETCHED"),
            data: countries,
            pagination: {
                totalCountries,
                totalPages,
                currentPage: page,
                limit
            },
            err: null
        });
    } catch (error) {
        console.error("Error in getting countries:", error);
        return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
            msg: i18n.__("messages.INTERNAL_ERROR"),
            data: error.message,
            err: null,
        });
    }
};

module.exports = getAllCountry;
