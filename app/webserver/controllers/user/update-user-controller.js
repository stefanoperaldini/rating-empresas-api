"use strict";

const Joi = require("@hapi/joi");
const mysqlPool = require("../../../database/mysql-pool");

async function validate(payload) {
  const schema = Joi.object({
    linkedin: Joi.string()
      .allow("")
      .uri(),
    role: Joi.number()
      .integer()
      .min(1)
      .max(2)
      .required()
  });
  Joi.assert(payload, schema);
}

async function updateUser(req, res, next) {
  const { userId } = req.claims;

  const accountData = { ...req.body };

  try {
    await validate(accountData);
  } catch (e) {
    console.error(e);
    return res.status(400).send(e);
  }

  const now = new Date()
    .toISOString()
    .substring(0, 19)
    .replace("T", " ");

  let connection;
  try {
    connection = await mysqlPool.getConnection();

    const sqlUpdateUser = `UPDATE users
                                SET linkedin = ?,
                                role = ?,
                                modified_at = ?
                                WHERE id = ? AND deleted_at IS NULL`;

    const [updateStatus] = await connection.execute(sqlUpdateUser, [
      accountData.linkedin,
      accountData.role,
      now,
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
    return res.status(500).send(e.message);
  }
}

module.exports = updateUser;
