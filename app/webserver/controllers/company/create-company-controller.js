"use strict";

const Joi = require("@hapi/joi");
const uuidV4 = require("uuid/v4");
const mysqlPool = require("../../../database/mysql-pool");

const httpServerDomain = process.env.HTTP_SERVER_DOMAIN;

async function validate(payload) {
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
    sede_id: Joi.string()
      .guid({
        version: ["uuidv4"]
      })
      .required()
  });

  Joi.assert(payload, schema);
}

async function createCompany(req, res, next) {
  const companyData = { ...req.body };
  const { userId } = req.claims;

  try {
    await validate(companyData);
  } catch (e) {
    console.error(e);
    return res.status(400).send("Data are not valid");
  }

  const now = new Date()
    .toISOString()
    .substring(0, 19)
    .replace("T", " ");
  const {
    name,
    description,
    sector_id,
    url_web,
    linkedin,
    address,
    sede_id,
    url_logo
  } = companyData;

  const companyId = uuidV4();
  const company = {
    id: companyId,
    name,
    description,
    sector_id,
    url_web,
    linkedin,
    address,
    sede_id,
    url_logo,
    user_id: userId,
    created_at: now
  };

  try {
    const connection = await mysqlPool.getConnection();
    try {
      const sqlCreateCompany = "INSERT INTO companies SET ?";
      await connection.query(sqlCreateCompany, company);

      try {
        const sqlAddCity = "INSERT INTO companies_cities SET ?";
        await connection.query(sqlAddCity, {
          city_id: sede_id,
          company_id: companyId
        });
      } catch (e) {
        console.error(e);
      }

      connection.release();

      res.header("Location", `${httpServerDomain}/v1/companies/${companyId}`);
      return res.status(201).send();
    } catch (e) {
      if (connection) {
        connection.release();
      }

      if (e.code === "ER_DUP_ENTRY") {
        return res.status(409).send("Company already exists");
      }

      console.error(e);
      return res.status(500).send();
    }
  } catch (e) {
    console.error(e);
    return res.status(500).send();
  }
}

module.exports = createCompany;
