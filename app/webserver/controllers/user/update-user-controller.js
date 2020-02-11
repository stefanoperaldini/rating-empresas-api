"use strict";

const Joi = require("@hapi/joi");
const mysqlPool = require("../../../database/mysql-pool");

async function validate(payload) {
  const schema = Joi.object({
    linkedin: Joi.string()
      .allow("")
      .uri(),
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
    return res.status(400).send("Data are not valid");
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
                                modified_at = ?
                                WHERE id = ? AND deleted_at IS NULL`;

    const [updateStatus] = await connection.execute(sqlUpdateUser, [
      accountData.linkedin,
      now,
      userId
    ]);
    connection.release();

    if (updateStatus.changedRows !== 1) {
      return res.status(404).send("User not found");
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

module.exports = updateUser;
