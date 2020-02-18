"use strict";

const Joi = require("@hapi/joi");
//const redis = require("redis");

const mysqlPool = require("../../../database/mysql-pool");

async function validate(payload) {
  const schema = Joi.object({
    row4page: Joi.number(),
    page: Joi.number(),
    filters: Joi.string().min(2).max(3),
    sectorId: Joi.string().guid({
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

async function getCompanies(req, res) {
  let { row4page, page, sectorId, positionId, cityId, sortTipe, filters, } = req.query;

  try {
    await validate({ row4page, page, sectorId, positionId, cityId, sortTipe, filters });
  } catch (e) {
    console.error(e);
    return res.status(400).send("Data are not valid");
  }

  let connection;

  try {
    connection = await mysqlPool.getConnection();
    let numsRows = 0;
    let rows = [];
    if (filters === undefined || filters === "yes") {
      let strSort = "ORDER BY everage DESC";
      switch (sortTipe) {
        case "2":
          strSort = "ORDER BY r.salary_valuation DESC";
          break;
        case "3":
          strSort = "ORDER BY r.inhouse_training DESC";
          break;
        case "4":
          strSort = "ORDER BY r.growth_opportunities DESC";
          break;
        case "5":
          strSort = "ORDER BY r.work_enviroment DESC";
          break;
        case "6":
          strSort = "ORDER BY r.personal_life DESC";
          break;
        case "7":
          strSort = "ORDER BY c.name ASC";
          break;
      }

      let optWhere = "WHERE r.deleted_at IS NULL";
      let queryParams = [];

      if (sectorId || positionId || cityId) {
        if (sectorId) {
          optWhere = `${optWhere} AND c.sector_id = ?`;
          queryParams = [...queryParams, sectorId,];
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

      let sqlQuery = `SELECT COUNT(*) as numsRows FROM (
                        SELECT COUNT(r.id) as n_review
                        FROM reviews AS r
                        LEFT JOIN companies c
                        ON r.company_id = c.id
                        LEFT JOIN sectors s
                        ON c.sector_id = s.id
                        LEFT JOIN cities AS ci
                        ON r.city_id = ci.id
                      ${ optWhere}
                      GROUP BY c.id) AS tempCompanies`;

      [rows] = await connection.query(sqlQuery, queryParams);

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

      sqlQuery = `SELECT c.id as company_id, c.name, sec.id AS sector_id, sec.sector AS sector_name, ci.id AS sede_id, 
                    res_companies.user_id, ci.name AS sede_name,
                    c.description, c.url_web, c.linkedin, c.url_logo, c.address,
                    n_review, 
                    avg_salary, 
                    avg_inhouse_training,
                    avg_growth_opportunities,
                    avg_work_enviroment,
                    avg_personal_life,
                    avg_salary_valuation
                    everage
                  FROM(
                        SELECT *, (avg_salary_valuation + avg_inhouse_training + avg_growth_opportunities + avg_work_enviroment +  avg_personal_life )/5.0 as everage
                        FROM(
                            SELECT c.id, c.name, c.sector_id, c.sede_id, c.user_id,
                                    COUNT(r.id) as n_review,
                                    ROUND(AVG(salary),1) AS avg_salary,
                                    ROUND(AVG(inhouse_training),1) AS avg_inhouse_training,
                                    ROUND(AVG(growth_opportunities),1) AS avg_growth_opportunities,
                                    ROUND(AVG(work_enviroment),1) AS avg_work_enviroment,
                                    ROUND(AVG(personal_life),1) AS avg_personal_life,
                                    ROUND(AVG(salary_valuation),1) AS avg_salary_valuation
                            FROM reviews AS r
                            LEFT JOIN companies c
                            ON r.company_id = c.id
                            LEFT JOIN sectors s
                            ON c.sector_id = s.id
                            LEFT JOIN cities AS ci
                            ON r.city_id = ci.id
                            ${optWhere}
                            GROUP BY c.id
                        ) AS tmp_companies 
                  ) AS res_companies
                  LEFT JOIN companies c
                  ON res_companies.id = c.id
                  LEFT JOIN sectors AS sec
                  ON res_companies.sector_id = sec.id
                  LEFT JOIN cities AS ci
                  ON res_companies.sede_id = ci.id
                  INNER JOIN users AS u 
                  ON u.id = res_companies.user_id
                  ${strSort}
                  LIMIT ?,?;`;

      // Manage query REDIS 
      //const clientRedis = await redis.createClient();

      //await clientRedis.get(`query:${optWhere}-${strSort}-${queryParams}-${offset}-${row4page}`, async function (err, result) {
      // key exist in Redis store
      // if (result) {
      //   return res.send({
      //     numsRows,
      //     page,
      //     rows_companies: JSON.parse(result),
      //   });
      // }
      // if (err) {
      //   console.error(err);
      // }

      [rows] = await connection.execute(sqlQuery, [...queryParams, offset, row4page]);
    } else {
      let sqlQuery = `SELECT COUNT(*) as numsRows FROM companies`;
      page = 1;
      [rows] = await connection.execute(sqlQuery);
      numsRows = parseInt(rows[0].numsRows);
      sqlQuery = `SELECT c.id as company_id, c.name, c.user_id, c.description, 
                    c.url_web, c.linkedin, c.url_logo, c.address,
                    sec.id AS sector_id, sec.sector AS sector_name, 
                    ci.id AS sede_id, ci.name AS sede_name,
                    c.user_id, c.description, c.url_web, c.linkedin, c.url_logo, c.address,
                    u.role as userRole, u.deleted_at as userDeleteAt
                  FROM companies c
                  LEFT JOIN sectors AS sec
                  ON c.sector_id = sec.id
                  LEFT JOIN cities AS ci
                  ON c.sede_id = ci.id
                  INNER JOIN users AS u 
                  ON u.id = c.user_id
                  ORDER BY name`;
      [rows] = await connection.execute(sqlQuery);
    }

    connection.release();

    if (rows.length === 0) {
      return res.status(404).send("Companies not founded");
    }

    // try {
    //   await clientRedis.set(`query:${optWhere}-${strSort}-${queryParams}-${offset}-${row4page}`, JSON.stringify(rows), 'EX', process.env.REDIS_TTL_QUERY);
    // } catch (e) {
    //   console.error(e);
    // }

    return res.send({
      numsRows,
      page,
      rows_companies: rows,
    });
    // });

  } catch (e) {
    if (connection) {
      connection.release();
    }
    console.error(e);
    return res.status(500).send();
  }
}

module.exports = getCompanies;
