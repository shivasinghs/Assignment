const { HTTP_STATUS_CODE } = require("../../../../config/constants");
const i18n = require("../../../../config/i18n");
const sequelize = require("../../../../config/sequelize");

const getAllSubCategory = async (req, res) => {
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
            SELECT sc.id, sct.name, sct.lang
            FROM sub_category sc
            LEFT JOIN sub_category_trans sct 
                ON sct.subcategory_id = sc.id 
                AND sct.lang = :lang
            WHERE sc.is_deleted = false 
            GROUP BY sc.id, sct.name, sct.lang
            ORDER BY sct.${sortBy} ${sortOrder}
            LIMIT :limit OFFSET :offset
        `;

        const subcategories = await sequelize.query(query, {
            replacements: { lang, limit: parseInt(limit), offset: parseInt(offset) },
            type: sequelize.QueryTypes.SELECT,
            raw: true
        });

        if (!subcategories || subcategories.length === 0) {
            return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
                msg: i18n.__("SubCategory.SUBCATEGORY_NOT_FOUND"),
                data: "",
                err: null
            });
        }

        const countQuery = `
            SELECT COUNT(*) as totalSubCategories
            FROM sub_category sc
            WHERE sc.is_deleted = false
        `;
        const countResult = await sequelize.query(countQuery, {
            type: sequelize.QueryTypes.SELECT,
            raw: true
        });

        const totalSubCategories = countResult[0]?.totalSubCategories || 0;
        const totalPages = Math.ceil(totalSubCategories / limit);

        return res.status(HTTP_STATUS_CODE.OK).json({
            msg: i18n.__("SubCategory.SUBCATEGORY_FETCHED"),
            data: subcategories,
            pagination: {
                totalSubCategories,
                totalPages,
                currentPage: page,
                limit
            },
            err: null
        });
    } catch (error) {
        console.error("Error in getting subcategories:", error);
        return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
            msg: i18n.__("messages.INTERNAL_ERROR"),
            data: error.message,
            err: null,
        });
    }
};

module.exports = getAllSubCategory;
