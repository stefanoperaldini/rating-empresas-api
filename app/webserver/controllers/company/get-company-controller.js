"use strict";

const Joi = require("@hapi/joi");
const mysqlPool = require("../../../database/mysql-pool");

async function validate(payload) {
  const schema = Joi.object({
    companyId: Joi.string()
      .guid({
        version: ["uuidv4"]
      })
      .required()
  });

  Joi.assert(payload, schema);
}

async function getCompany(req, res, next) {
  const companyId = req.params.companyId;
  try {
    await validate({ companyId });
  } catch (e) {
    console.error(e);
    return res.status(400).send("Data are not valid");
  }

  try {
    const connection = await mysqlPool.getConnection();
    const getCompanyQuery = `SELECT c.id as company_id, c.name, sec.sector AS sector_name, ci.id AS sede_id,
                              res_companies.user_id, ci.name AS sede_name,
                              c.description, c.url_web, c.linkedin, c.url_logo, c.address,
                              n_review,
                              avg_salary,
                              avg_inhouse_training,
                              avg_growth_opportunities,
                              avg_work_enviroment,
                              avg_personal_life,
                              avg_salary_valuation
                            FROM(
                              SELECT *, (avg_salary_valuation + avg_inhouse_training + avg_growth_opportunities + avg_work_enviroment +  avg_personal_life )/5.0 as everage
                              FROM(
                                    SELECT c.id, c.name, c.sector_id, c.sede_id, c.user_id,
                                    COUNT(r.id) as n_review,
                                    ROUND(AVG(salary), 1) AS avg_salary,
                                    ROUND(AVG(inhouse_training), 1) AS avg_inhouse_training,
                                    ROUND(AVG(growth_opportunities), 1) AS avg_growth_opportunities,
                                    ROUND(AVG(work_enviroment), 1) AS avg_work_enviroment,
                                    ROUND(AVG(personal_life), 1) AS avg_personal_life,
                                    ROUND(AVG(salary_valuation), 1) AS avg_salary_valuation
                                                    FROM reviews AS r
                                                    LEFT JOIN companies c
                                                    ON r.company_id = c.id
                                                    LEFT JOIN sectors s
                                                    ON c.sector_id = s.id
                                                    LEFT JOIN cities AS ci
                                                    ON r.city_id = ci.id
                                                    WHERE r.deleted_at IS NULL
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
                            WHERE c.id = ?`;
    const [results] = await connection.execute(getCompanyQuery, [companyId]);
    connection.release();
    if (results.length === 0) {
      return res.status(404).send("Company not found");
    }

    return res.send(results[0]);

  } catch (e) {
    console.error(e);
    return res.status(500).send();
  }
}

module.exports = getCompany;
