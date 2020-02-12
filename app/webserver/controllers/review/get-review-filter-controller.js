"use strict";

const Joi = require("@hapi/joi");
const mysqlPool = require("../../../database/mysql-pool");
const math = require("mathjs");

async function validate(payload) {
  const schema = Joi.object({
    row4page: Joi.number(),
    page: Joi.number(),
    companyId: Joi.string().guid({
      version: ["uuidv4"]
    }),
    positionId: Joi.string().guid({
      version: ["uuidv4"]
    }),
    cityId: Joi.string().guid({
      version: ["uuidv4"]
    }),
    sectorId: Joi.string().guid({
      version: ["uuidv4"]
    })
  });
  Joi.assert(payload, schema);
}

async function getReviewsFilter(req, res) {
  let { row4page, page, companyId, positionId, cityId, sectorId } = req.query;

  try {
    await validate({ row4page, page, companyId, positionId, cityId, sectorId });
  } catch (e) {
    console.error(e);
    return res.status(400).send("Data are not valid");
  }

  let numsRows = 0;

  let connection;
  try {
    connection = await mysqlPool.getConnection();
    let sqlQuery = "SELECT COUNT(*) as numsRows FROM reviews;";
    let [rows] = await connection.query(sqlQuery);
    numsRows = parseInt(rows[0].numsRows);
    let offset = 0;
    if ((row4page != undefined) & (page != undefined)) {
      row4page = parseInt(row4page);
      page = parseInt(page);
      offset = row4page * (page - 1);
    } else {
      page = 1;
      row4page = numsRows;
    }

    let optWhere = "WHERE r.deleted_at IS NULL";
    let queryParams = [offset, row4page];

    if (companyId || positionId || cityId || sectorId) {
      if (companyId) {
        optWhere = `${optWhere} AND r.company_id = ?`;
        queryParams = [companyId, ...queryParams];
      }

      if (positionId) {
        optWhere = `${optWhere} AND p.id = ?`;
        queryParams = [positionId, ...queryParams];
      }

      if (cityId) {
        optWhere = `${optWhere} AND ci.id = ?`;
        queryParams = [cityId, ...queryParams];
      }

      if (sectorId) {
        optWhere = `${optWhere} AND s.id = ?`;
        queryParams = [sectorId, ...queryParams];
      }
    }

    sqlQuery = `SELECT r.id, r.start_year, r.end_year, r.created_at, r.salary,
                        r.salary_valuation, r.inhouse_training, r.growth_opportunities, 
                        r.work_enviroment, r.personal_life, r.comment_title, r.comment, 
                        p.name, ci.name as city_name, s.sector
                      FROM reviews r
                        LEFT JOIN positions p
                        ON r.position_id = p.id
                        LEFT JOIN companies c
                        ON r.company_id = c.id
                        LEFT JOIN sectors s
                        ON c.sector_id = s.id
                        LEFT JOIN cities ci
                        ON r.city_id = ci.id
                       ${optWhere}
                      ORDER BY r.created_at DESC LIMIT ?,?;`;

    [rows] = await connection.execute(sqlQuery, queryParams);

    connection.release();

    if (rows.length === 0) {
      return res.status(404).send("Review(s) not found");
    }

    const reviews = rows.map(review => {
      const created_at = review.created_at.toISOString().substring(0, 10);
      const everage = math.round(math.divide((parseInt(review.inhouse_training) + parseInt(review.growth_opportunities) + parseInt(review.work_enviroment) + parseInt(review.personal_life) + parseInt(review.salary_valuation)), 5), 1);

      return {
        ...review,
        created_at,
        everage,
      };
    });

    numsRows = reviews.length;

    return res.send({
      numsRows,
      page,
      reviews
    });
  } catch (e) {
    if (connection) {
      connection.release();
    }
    console.error(e);
    return res.status(500).send();
  }
}

module.exports = getReviewsFilter;
