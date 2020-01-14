"use strict";

const Joi = require("@hapi/joi");
const uuidV4 = require("uuid/v4");
const mysqlPool = require("../../../database/mysql-pool");

const httpServerDomain = process.env.HTTP_SERVER_DOMAIN;

/*
{
    "name": "My company name",
    "description": "My company description",
    "sector_id": "My company sector",
    "url_web": "My company url",
    "linkedin": "My company linkedin",
    "address": "My company address",
    "sede_id": "My company sede"
}
*/
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
      .uri(),
    linkedin: Joi.string()
      .allow("")
      .uri(),
    address: Joi.string()
      .min(10)
      .max(60),
    sede_id: Joi.string().guid({
      version: ["uuidv4"]
    }).required()
  });

  Joi.assert(payload, schema);
}

async function createCompany(req, res, next) {
  const companyData = { ...req.body };
  const { userId, role } = req.claims;

  if (parseInt(role) !== 2) {
    return res.status(401).send({
      message: "Only an user type 2 can create a company profile"
    });
  }

  try {
    await validate(companyData);
  } catch (e) {
    return res.status(400).send(e);
  }

  // tabla company
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
    sede_id
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
    user_id: userId,
    created_at: now
  };

  try {
    const connection = await mysqlPool.getConnection();
    try {
      const sqlCreateCompany = "INSERT INTO companies SET ?";
      await connection.query(sqlCreateCompany, company);

      /**
       * At this point, company was created, so,
       * we can associate the city
       *  - insertar relación entre sede y company en la tabla companies_cities
       *  - city_id, company_id
       */

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
        return res.status(409).send();
      }
    }
  } catch (e) {
    console.error(e);
    return res.status(500).send();
  }
}

module.exports = createCompany;
