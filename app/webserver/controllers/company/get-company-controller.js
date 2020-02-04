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
    const payload = {
      companyId
    };
    await validate(payload);
  } catch (e) {
    console.error(e);
    return res.status(400).send("Data are not valid");
  }

  try {
    const connection = await mysqlPool.getConnection();
    const getCompanyQuery = `SELECT c.id, c.name, c.description,
      c.url_web, c.linkedin, c.url_logo, c.address, c.sede_id, c.sector_id, 
      ci.name as city_name, s.sector, c.user_id,
      u.role
      FROM companies AS c
      INNER JOIN users AS u ON u.id = c.user_id
      INNER JOIN sectors AS s ON c.sector_id = s.id
      INNER JOIN cities AS ci ON c.sede_id = ci.id
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
