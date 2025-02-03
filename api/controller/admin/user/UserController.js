const { HTTP_STATUS_CODE } = require("../../../../config/constants");
const i18n = require("../../../../config/i18n");
const Sequelize = require("../../../../config/sequelize");

const getUsersWithFilters = async ({ city, country, search, page = 1, pageSize = 10, sortOrder = "ASC", sortBy = "created_at" }, res) => {
  try {
    const offset = (page - 1) * pageSize;
    const limit = parseInt(pageSize, 10);

    let whereClause = 'WHERE u."is_deleted" = false';

    if (search) {
      whereClause += ` AND (u.email ILIKE '%${search}%' OR u.name ILIKE '%${search}%')`;
    }

    if (city) {
      whereClause += ` AND u.city_id = :city`;
    }

    if (country) {
      whereClause += ` AND u.country_id = :country`;
    }

    const query = `
       SELECT 
       u.id, 
       u.name, 
       u.email,
       COUNT(a.id) AS accountCount, 
       c.id AS cityId, 
       co.id AS countryId,
       u.created_at  
       FROM "user" u
       LEFT JOIN "mst_city" c ON u."city_id" = c.id AND c."is_deleted" = false
       LEFT JOIN "mst_country" co ON u."country_id" = co.id AND co."is_deleted" = false
       LEFT JOIN "account" a ON u.id = a.user_id AND a."is_deleted" = false
       WHERE u."is_deleted" = false
       GROUP BY u.id, c.id, co.id, u.created_at 
       ORDER BY ${sortBy} ${sortOrder} 
       LIMIT :limit OFFSET :offset;
    `;

    const users = await Sequelize.query(query, {
      replacements: {
        city: city,
        country: country,
        limit: limit,
        offset: offset,
      },
      type: Sequelize.QueryTypes.SELECT,
    });

    const countQuery = `
      SELECT COUNT(*) AS totalUsers
      FROM "user" u
      ${whereClause};
    `;

    const countResult = await Sequelize.query(countQuery, {
      replacements: {
        city: city,
        country: country
      },
      type: Sequelize.QueryTypes.SELECT,
      raw: true
    });

    const totalUsers = countResult[0]?.totalUsers || 0;

    return res.status(HTTP_STATUS_CODE.OK).json({
      msg: "Users fetched successfully",
      data: users,
      totalUsers: totalUsers, 
    });
  } catch (error) {
    console.error("Error in fetching users:", error);
    return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
      msg: "Internal server error",
      data: error.message,
      err: error,
    });
  }
};

module.exports = getUsersWithFilters;
