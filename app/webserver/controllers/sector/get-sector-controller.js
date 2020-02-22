"use strict";

const Joi = require("@hapi/joi");
const mysqlPool = require("../../../database/mysql-pool");

async function validate(payload) {
  const schema = Joi.object({
    sectorId: Joi.string()
      .guid({
        version: ["uuidv4"]
      })
      .required()
  });

  Joi.assert(payload, schema);
}

async function getSector(req, res) {
  const sectorId = req.params.sectorId;

  try {
    await validate({ sectorId });
  } catch (e) {
    console.error(e);
    return res.status(400).send("Data are not valid");
  }

  try {
    const connection = await mysqlPool.getConnection();
    const getSectorQuery = `SELECT id, sector 
      FROM sectors
      WHERE id = ?`;
    const [results] = await connection.execute(getSectorQuery, [sectorId]);
    connection.release();
    if (results.length === 0) {
      return res.status(404).send("Sector not found");
    }

    return res.send(results[0]);
  } catch (e) {
    console.error(e);
    return res.status(500).send();
  }
}

module.exports = getSector;
