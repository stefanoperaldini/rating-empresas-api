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

async function deleteReview(req, res) {
  const { reviewId } = req.params;

  try {
    await validate({ reviewId });
  } catch (e) {
    console.error(e);
    return res.status(400).send("Data are not valid");
  }

  let connection;
  try {
    connection = await mysqlPool.getConnection();
    const sqlQuery = `UPDATE reviews
      SET deleted_at = ?
      WHERE id = ?
        AND deleted_at IS NULL`;

    const now = new Date()
      .toISOString()
      .substring(0, 19)
      .replace("T", " ");

    const [deletedStatus] = await connection.execute(sqlQuery, [now, reviewId]);
    connection.release();

    if (deletedStatus.changedRows !== 1) {
      return res.status(404).send("Review not found");
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

module.exports = deleteReview;
