"use strict";

const Joi = require("@hapi/joi");
const mysqlPool = require("../../../database/mysql-pool");

async function validate(payload) {
    const schema = Joi.object({
        companyId: Joi.string()
            .guid({
                version: ["uuidv4"]
            })
            .required()
    });
    Joi.assert(payload, schema);
}

async function getPositions(req, res) {
    const companyId = req.params.companyId;
    try {
        await validate({ companyId });
    } catch (e) {
        console.error(e);
        return res.status(400).send("Data are not valid");
    }

    let numsRows = 0;

    let connection;
    try {
        connection = await mysqlPool.getConnection();
        const sqlQuery = `SELECT distinct p.id, p.name
                        FROM reviews
                        LEFT JOIN positions AS p
                        ON reviews.position_id = p.id
                    WHERE  reviews.company_id = ?
                    ORDER BY p.name`;
        const [rows] = await connection.execute(sqlQuery, [companyId,]);
        connection.release();
        return res.send(rows);
    } catch (e) {
        if (connection) {
            connection.release();
        }
        console.error(e);
        return res.status(500).send();
    }
}

module.exports = getPositions;
