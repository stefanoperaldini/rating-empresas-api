"use strict";

const Joi = require("@hapi/joi");
const mysqlPool = require("../../../database/mysql-pool");

async function validate(payload) {
  const schema = Joi.object({
    row4page: Joi.number(),
    page: Joi.number()
  });
  Joi.assert(payload, schema);
}

async function getCompanies(req, res) {
  let { row4page, page } = req.query;

  try {
    await validate({ row4page, page });
  } catch (e) {
    console.error(e);
    return res.status(400).send("Data are not valid");
  }

  let numsRows = 0;

  let connection;
  try {
    connection = await mysqlPool.getConnection();
    let sqlQuery = "SELECT COUNT(*) as numsRows FROM companies;";
    let [rows] = await connection.query(sqlQuery);
    numsRows = parseInt(rows[0].numsRows);
    let offset = 0;
    if ((row4page != undefined) & (page != undefined)) {
      row4page = parseInt(row4page);
      page = parseInt(page);
      offset = row4page * (page - 1);
    } else {
      page = 1;
      row4page = numsRows;
    }

    sqlQuery = `SELECT com.id, com.name,
      com.url_web, com.linkedin, com.url_logo, com.address, com.sede_id, com.sector_id
      FROM companies com
      ORDER BY com.name LIMIT ?,?;`;
    [rows] = await connection.execute(sqlQuery, [offset, row4page]);
    connection.release();
    return res.send({
      numsRows,
      page,
      rows
    });
  } catch (e) {
    if (connection) {
      connection.release();
    }
    console.error(e);
    return res.status(500).send();
  }
}

module.exports = getCompanies;
