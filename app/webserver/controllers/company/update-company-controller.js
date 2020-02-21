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
      .uri()
      .max(255),
    url_logo: Joi.string()
      .allow("")
      .uri()
      .max(255),
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

async function updateCompany(req, res) {
  const { companyId } = req.params;
  const { userId } = req.claims;
  const companyData = {
    ...req.body,
    companyId,
    userId
  };

  try {
    await validateSchema(companyData);
  } catch (e) {
    console.error(e);
    return res.status(400).send("Data are not valid");
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
        user_id = ?,
        updated_at = ?,
        url_logo = ?
          WHERE id = ?`;

    const [updateStatus] = await connection.query(sqlUpdateCompany, [
      companyData.name,
      companyData.description,
      companyData.sector_id,
      companyData.url_web,
      companyData.linkedin,
      companyData.address,
      companyData.sede_id,
      userId,
      now,
      companyData.url_logo,
      companyId
    ]);
    connection.release();

    if (updateStatus.changedRows !== 1) {
      return res.status(404).send("Company not found");
    }

    return res.status(204).send();
  } catch (e) {
    if (connection) {
      connection.release();
    }
    console.error(e);
    return res.status(500).send();
  }
}

module.exports = updateCompany;
