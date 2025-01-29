const { HTTP_STATUS_CODE, Op } = require("../../../../config/constants")
const i18n = require("../../../../config/i18n")
const Sequelize = require("../../../../config/sequelize")

const getUsersWithFilters = async (req, res) => {
  try {
    const {
      city,
      country,
      search,
      page = 1,
      pageSize = 10,
      sortOrder = "ASC"
    } = req.query

    const offset = (page - 1) * pageSize
    const limit = parseInt(pageSize, 10)

    const query = `
      SELECT 
        u.id, u.name, u.email,
        COUNT(a.id) AS accountCount, 
        c.id AS cityId, co.id AS countryId
      FROM user u
      LEFT JOIN mst_city c ON u.city_id = c.id
      LEFT JOIN mst_country co ON u.country_id = co.id
      LEFT JOIN Account a ON u.id = a.user_id
      WHERE u.is_deleted = false
      ${
        search
          ? `AND (u.email ILIKE '%${search}%' OR u.name ILIKE '%${search}%')`
          : ""
      }
      ${city ? `AND u.city_id = :city` : ""}
      ${country ? `AND u.country_id = :country` : ""}
      GROUP BY u.id, c.id, co.id
      ORDER BY u.name ${sortOrder}
      LIMIT :limit OFFSET :offset;
    `

    const users = await Sequelize.query(query, {
      replacements: {
        city: city || null,
        country: country || null,
        limit: limit,
        offset: offset
      },
      type: Sequelize.QueryTypes.SELECT
    })

    return res.status(200).json({
      msg: "Users fetched successfully",
      data: users
    })
  } catch (error) {
    console.error("Error in fetching users:", error)
    return res.status(500).json({
      msg: "Internal server error",
      data: error.message,
      err: ""
    })
  }
}

module.exports = getUsersWithFilters
