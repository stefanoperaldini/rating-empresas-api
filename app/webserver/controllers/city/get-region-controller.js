"use strict";

const Joi = require("@hapi/joi");
const mysqlPool = require("../../../database/mysql-pool");

async function validate(payload) {
    const schema = Joi.object({
        regionId: Joi.number().required()
    });
    Joi.assert(payload, schema);
}

async function getRegion(req, res) {
    const regionId = req.params.regionId;
    try {
        await validate({ regionId });
    } catch (e) {
        return res.status(400).send(e);
    }
    let connection;
    try {
        connection = await mysqlPool.getConnection();
        const sqlQuery = `SELECT * 
                          FROM regions 
                          WHERE id=?;`;
        const [rows] = await connection.execute(sqlQuery, [regionId]);
        connection.release();
        if (rows.length === 0) {
            return res.status(404).send("Region not found");
        }
        res.send(rows);
    } catch (e) {
        if (connection) {
            connection.release();
        }
        console.error(e);
        return res.status(500).send();
    }
}

module.exports = getRegion;
