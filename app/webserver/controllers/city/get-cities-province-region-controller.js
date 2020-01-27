"use strict";

const Joi = require("@hapi/joi");
const mysqlPool = require("../../../database/mysql-pool");

async function validate(payload) {
    const schema = Joi.object({
        regionId: Joi.number().required(),
        provinceId: Joi.number().required(),
    });
    Joi.assert(payload, schema);
}

async function getCitiesProvinceRegion(req, res) {
    const regionId = req.params.regionId;
    const provinceId = req.params.provinceId;
    try {
        await validate({ regionId, provinceId });
    } catch (e) {
        console.error(e);
        return res.status(400).send("Data are not valid");
    }
    let connection;
    try {
        connection = await mysqlPool.getConnection();
        const sqlQuery =
            `SELECT c.id, c.name 
             FROM cities AS c 
             WHERE c.region_id =? AND c.province_id =? 
             ORDER BY c.name;`;
        const [rows] = await connection.execute(sqlQuery, [regionId, provinceId]);
        connection.release();
        if (rows.length === 0) {
            return res.status(404).send("Cities not founded");
        }
        return res.send(rows);
    } catch (e) {
        if (connection) {
            connection.release();
        }
        console.error(e);
        return res.status(500).send();
    }
}

module.exports = getCitiesProvinceRegion;
