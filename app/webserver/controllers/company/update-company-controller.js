"use strict";

const Joi = require("@hapi/joi");
const mysqlPool = require("../../../database/mysql-pool");

async function validateSchema(payload) {
  const schema = Joi.object({
    name: Joi.string()
      .min(3)
      .max(60)
      .required(),
    description: Joi.string()
      .min(10)
      .max(1000),
    sector_id: Joi.string()
      .guid({
        version: ["uuidv4"]
      })
      .required(),
    url_web: Joi.string()
      .allow("")
      .uri(),
    linkedin: Joi.string()
      .allow("")
      .uri(),
    address: Joi.string()
      .min(10)
      .max(60),
    sede_id: Joi.string().guid({
      version: ["uuidv4"]
    }),
    companyId: Joi.string()
      .guid({
        version: ["uuidv4"]
      })
      .required(),
    userId: Joi.string()
      .guid({
        version: ["uuidv4"]
      })
      .required()
  });

  Joi.assert(payload, schema);
}

async function updateCompany(req, res, next) {
  const { companyId } = req.params;
  const { userId, role } = req.claims;
  const companyData = {
    ...req.body,
    companyId,
    userId
  };

  if (parseInt(role) !== 2) {
    return res.status(401).send({
      message: `Only an user type "enterprise" can create a company profile`
    });
  }

  try {
    await validateSchema(companyData);
  } catch (e) {
    console.error(e);
    return res.status(400).send(e);
  }

  let connection;
  try {
    connection = await mysqlPool.getConnection();
    const now = new Date()
      .toISOString()
      .replace("T", " ")
      .substring(0, 19);

    const sqlUpdateCompany = `UPDATE companies
      SET name = ?,
        description = ?,
        sector_id = ?,
        url_web = ?,
        linkedin = ?,
        address = ?,
        sede_id = ?,
        updated_at = ?
          WHERE id = ?
        AND user_id = ?`;

    const [updateStatus] = await connection.query(sqlUpdateCompany, [
      companyData.name,
      companyData.description,
      companyData.sector_id,
      companyData.url_web,
      companyData.linkedin,
      companyData.address,
      companyData.sede_id,
      now,
      companyId,
      userId
    ]);
    connection.release();

    if (updateStatus.changedRows !== 1) {
      return res.status(404).send();
    }

    return res.status(204).send();
  } catch (e) {
    if (connection) {
      connection.release();
    }

    console.error(e);
    return res.status(500).send({
      message: e.message
    });
  }
}

module.exports = updateCompany;
