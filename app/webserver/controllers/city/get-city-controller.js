"use strict";

const joi = require("@hapi/joi");
const mysqlPool = require("../../../database/mysql-pool");


async function validateCity(payload) {
    const schema = joi.object({
        regionId: joi.number().required(),
        provinceId: joi.number().required(),
        cityId: joi.string().guid({
            version: ['uuidv4'],
        }).required(),
    });
    joi.assert(payload, schema);
}

async function getCity(req, res) {
    const regionId = req.params.regionId;
    const provinceId = req.params.provinceId;
    const cityId = req.params.cityId;

    try {
        await validateCity({ regionId, provinceId, cityId });
    } catch (e) {
        return res.status(400).send(e);
    }

    let connection;
    try {
        connection = await mysqlPool.getConnection();
        const sqlQuery =
            "SELECT c.id, c.name, c.region_id, r.name, c.province_id, p.name FROM cities AS c INNER JOIN regions AS r ON c.region_id = r.id INNER JOIN provinces AS p ON c.province_id = p.id WHERE r.id =? AND p.id =? AND c.id =?; ";
        const [rows] = await connection.execute(sqlQuery, [
            regionId, provinceId, cityId,
        ]);
        connection.release();
        if (rows.length === 0) {
            return res.status(404).send("City not found");
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

module.exports = getCity;
