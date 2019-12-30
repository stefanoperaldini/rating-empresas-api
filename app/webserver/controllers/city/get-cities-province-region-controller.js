"use strict";

const joi = require("@hapi/joi");
const mysqlPool = require("../../../database/mysql-pool");

async function validateMunicipiosProvinciaCcaa(payload) {
    const schema = joi.object({
        regionId: joi.number().required(),
        provinceId: joi.number().required(),
    });
    joi.assert(payload, schema);
}

async function getCitiesProvinceRegion(req, res) {
    const regionId = req.params.regionId;
    const provinceId = req.params.provinceId;
    try {
        await validateMunicipiosProvinciaCcaa({ regionId, provinceId });
    } catch (e) {
        return res.status(400).send(e);
    }
    let connection;
    try {
        connection = await mysqlPool.getConnection();
        const sqlQuery =
            "SELECT c.id, c.name FROM cities AS c WHERE c.region_id =? AND c.province_id =? ORDER BY c.name;";
        const [rows] = await connection.execute(sqlQuery, [regionId, provinceId]);
        connection.release();
        if (rows.length === 0) {
            return res.status(404).send("Cities not founded");
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

module.exports = getCitiesProvinceRegion;
