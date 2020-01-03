"use strict";

const Joi = require("@hapi/joi");
const mysqlPool = require("../../../database/mysql-pool");

async function validate(payload) {
    const schema = Joi.object({
        regionId: Joi.number().required()
    });
    Joi.assert(payload, schema);
}

async function getProvincesRegion(req, res) {
    const regionId = req.params.regionId;

    try {
        await validate({ regionId });
    } catch (e) {
        return res.status(400).send(e);
    }

    let connection;
    try {
        connection = await mysqlPool.getConnection();
        const sqlQuery =
            "SELECT DISTINCT c.province_id, p.name FROM cities AS c INNER JOIN provinces AS p ON c.province_id = p.id WHERE c.region_id =? ORDER BY p.name; ";
        const [rows] = await connection.execute(sqlQuery, [regionId]);
        connection.release();
        if (rows.length === 0) {
            return res.status(404).send("Provinces not founded");
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

module.exports = getProvincesRegion;
