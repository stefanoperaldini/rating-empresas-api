"use strict";

const joi = require("@hapi/joi");
const mysqlPool = require("../../../database/mysql-pool");

async function validateCities(payload) {
    const schema = joi.object({
        row4page: joi.number(),
        page: joi.number()
    });
    joi.assert(payload, schema);
}

async function getCities(req, res) {
    let { row4page, page } = req.query;

    try {
        await validateCities({ row4page, page });
    } catch (e) {
        res.status(400).send(e);
    }

    let numsRows = 0;

    let connection;
    try {
        connection = await mysqlPool.getConnection();
        let sqlQuery = "SELECT COUNT(*) as numsRows FROM cities;";
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

        sqlQuery =
            "SELECT c.region_id, r.name, c.province_id, p.name, c.id, c.name FROM cities AS c INNER JOIN regions AS r ON c.region_id = r.id INNER JOIN provinces AS p ON c.province_id = p.id ORDER BY c.name LIMIT ?,?;";
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

module.exports = {
    getCities,
};
