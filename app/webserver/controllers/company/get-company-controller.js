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
    return res.status(400).send(e);
  }

  try {
    const connection = await mysqlPool.getConnection();
    const getCompanyQuery = `SELECT com.id, com.name,
      com.url_web, com.linkedin, com.url_logo, com.address, com.sede_id, com.sector_id
      FROM companies com
      WHERE com.id = ?`;
    const [results] = await connection.execute(getCompanyQuery, [companyId]);
    connection.release();
    if (results.length === 0) {
      return res.status(404).send();
    }

    const [companyData] = results;

    return res.send({
      data: companyData
    });
  } catch (e) {
    console.error(e);
    res.status(500).send({
      message: e.message
    });
  }
}

module.exports = getCompany;
