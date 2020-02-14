"use strict";

const Joi = require("@hapi/joi");
const mysqlPool = require("../../../database/mysql-pool");


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
    sortTipe: Joi.number()
      .integer()
      .min(1)
      .max(7)
  });
  Joi.assert(payload, schema);
}

async function getReviewsFilter(req, res) {
  let { row4page, page, companyId, positionId, cityId, sortTipe } = req.query;

  try {
    await validate({ row4page, page, companyId, positionId, cityId, sortTipe });
  } catch (e) {
    console.error(e);
    return res.status(400).send("Data are not valid");
  }

  let connection;
  try {
    connection = await mysqlPool.getConnection();

    let strSort = "ORDER BY r.created_at DESC";
    switch (sortTipe) {
      case "2":
        strSort = "ORDER BY everage DESC";
        break;
      case "3":
        strSort = "ORDER BY r.salary_valuation DESC";
        break;
      case "4":
        strSort = "ORDER BY r.inhouse_training DESC";
        break;
      case "5":
        strSort = "ORDER BY r.growth_opportunities DESC";
        break;
      case "6":
        strSort = "ORDER BY r.work_enviroment DESC";
        break;
      case "7":
        strSort = "ORDER BY r.personal_life DESC";
        break;
    }

    let optWhere = "WHERE r.deleted_at IS NULL";
    let queryParams = [];

    if (companyId || positionId || cityId) {
      if (companyId) {
        optWhere = `${optWhere} AND r.company_id = ?`;
        queryParams = [...queryParams, companyId,];
      }

      if (positionId) {
        optWhere = `${optWhere} AND r.position_id = ?`;
        queryParams = [...queryParams, positionId,];
      }

      if (cityId) {
        optWhere = `${optWhere} AND r.city_id = ?`;
        queryParams = [...queryParams, cityId,];
      }
    }

    queryParams = [...queryParams,];

    let sqlQuery = `SELECT COUNT(*) as numsRows
                FROM reviews r
                LEFT JOIN positions p
                ON r.position_id = p.id
                LEFT JOIN companies c
                ON r.company_id = c.id
                LEFT JOIN sectors s
                ON c.sector_id = s.id
                LEFT JOIN cities ci
                ON r.city_id = ci.id
                ${ optWhere}`;
    let [rows] = await connection.query(sqlQuery, queryParams);

    let numsRows = parseInt(rows[0].numsRows);

    let offset = 0;
    if ((row4page != undefined) & (page != undefined)) {
      row4page = parseInt(row4page);
      page = parseInt(page);
      offset = row4page * (page - 1);
    } else {
      page = 1;
      row4page = numsRows;
    }

    sqlQuery = `SELECT r.id, r.start_year, r.end_year, r.created_at, r.salary,
                      r.salary_valuation, r.inhouse_training, r.growth_opportunities,
                      r.work_enviroment, r.personal_life, r.comment_title, r.comment,
                      p.name, ci.name as city_name, s.sector, 
                      (r.salary_valuation + r.inhouse_training + r.growth_opportunities + r.work_enviroment +  r.personal_life )/5.0 as everage
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
                    GROUP BY id
                    ${strSort}
                    LIMIT ?,?;`;

    [rows] = await connection.query(sqlQuery, [...queryParams, offset, row4page]);

    connection.release();

    if (rows.length === 0) {
      return res.status(404).send("Reviews not founded");
    }

    const reviews = rows.map(review => {
      const created_at = review.created_at.toISOString().substring(0, 10);

      return {
        ...review,
        created_at,
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
