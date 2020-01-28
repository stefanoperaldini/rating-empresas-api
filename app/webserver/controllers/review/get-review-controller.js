"use strict";

const Joi = require("@hapi/joi");
const mysqlPool = require("../../../database/mysql-pool");

async function validate(payload) {
  const schema = Joi.object({
    reviewId: Joi.string()
      .guid({
        version: ["uuidv4"]
      })
      .required()
  });

  Joi.assert(payload, schema);
}

async function getReview(req, res, next) {
  const { reviewId } = req.params;

  try {
    const payload = {
      reviewId
    };
    await validate(payload);
  } catch (e) {
    console.error(e);
    return res.status(400).send("Data are not valid");
  }

  let connection;
  try {
    connection = await mysqlPool.getConnection();
    //FIXME r.deleted_at,
    const sqlQuery = `SELECT r.id, r.start_year,
                        r.end_year, r.created_at, r.salary,
                        r.inhouse_training, r.growth_opportunities, r.work_enviroment, r.personal_life,
                        r.company_culture, r.salary_valuation, r.comment_title, r.comment
                      FROM reviews r
                      LEFT JOIN positions p
                        ON r.position_id = p.id
                      LEFT JOIN companies c
                        ON r.company_id = c.id
                      WHERE
                        r.id = ?
                        AND r.deleted_at IS NULL`;
    const [rows] = await connection.execute(sqlQuery, [reviewId]);
    connection.release();

    if (rows.length !== 1) {
      return res.status(404).send("Review not found");
    }

    const review = { ...rows[0] };

    review.created_at = review.created_at.toISOString().substring(0, 10);

    return res.send(review);
  } catch (e) {
    if (connection) {
      connection.release();
    }
    console.error(e);
    return res.status(500).send();
  }
}

module.exports = getReview;
