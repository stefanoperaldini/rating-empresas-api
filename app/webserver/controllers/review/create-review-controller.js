"use strict";

const Joi = require("@hapi/joi");
const uuidV4 = require("uuid/v4");
const mysqlPool = require("../../../database/mysql-pool");

const httpServerDomain = process.env.HTTP_SERVER_DOMAIN;

async function validate(payload) {
  const schema = Joi.object({
    position_id: Joi.string()
      .guid({
        version: ["uuidv4"]
      })
      .required(),
    start_year: Joi.number()
      .integer()
      .min(1980)
      .required(),
    end_year: Joi.number()
      .integer()
      .max(2020),
    salary: Joi.number().min(0),
    inhouse_training: Joi.number()
      .integer()
      .min(1)
      .max(5),
    growth_opportunities: Joi.number()
      .integer()
      .min(1)
      .max(5),
    work_enviroment: Joi.number()
      .integer()
      .min(1)
      .max(5),
    personal_life: Joi.number()
      .integer()
      .min(1)
      .max(5),
    company_culture: Joi.number()
      .integer()
      .min(1)
      .max(5),
    salary_valuation: Joi.number()
      .integer()
      .min(1)
      .max(5),
    comment_title: Joi.string()
      .min(5)
      .max(30)
      .required(),
    comment: Joi.string()
      .min(10)
      .max(1000)
      .required(),
    city_id: Joi.string()
      .guid({
        version: ["uuidv4"]
      })
      .required(),
    company_id: Joi.string()
      .guid({
        version: ["uuidv4"]
      })
      .required()
  });

  Joi.assert(payload, schema);
}

async function createReview(req, res, next) {
  const reviewData = { ...req.body };
  const { userId } = req.claims;

  try {
    await validate(reviewData);
  } catch (e) {
    console.error(e);
    return res.status(400).send("Data are not valid");
  }

  const now = new Date()
    .toISOString()
    .substring(0, 19)
    .replace("T", " ");

  const reviewId = uuidV4();
  const review = {
    id: reviewId,
    user_id: userId,
    created_at: now,
    ...reviewData
  };

  try {
    const connection = await mysqlPool.getConnection();
    try {
      const sqlCreateCompany = "INSERT INTO reviews SET ?";
      await connection.query(sqlCreateCompany, review);

      try {
        const sqlAddCity = "INSERT INTO companies_cities SET ?";
        await connection.query(sqlAddCity, {
          city_id: review.city_id,
          company_id: review.company_id
        });
      } catch (e) {
        if (e.code !== "ER_DUP_ENTRY") {
          console.error(e.message);
          return res.status(500).send();
        }
      }

      connection.release();

      res.header("Location", `${httpServerDomain}/v1/reviews/${reviewId}`);
      return res.status(201).send();
    } catch (e) {
      if (connection) {
        connection.release();
      }
      console.error(e);
      if (e.code === "ER_DUP_ENTRY") {
        return res.status(409).send("Review already exists");
      }
      return res.status(500).send();

    }
  } catch (e) {
    console.error(e);
    return res.status(500).send();
  }
}

module.exports = createReview;
