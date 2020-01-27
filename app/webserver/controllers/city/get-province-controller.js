"use strict";

const joi = require("@hapi/joi");
const mysqlPool = require("../../../database/mysql-pool");

async function validate(payload) {
    const schema = joi.object({
        provinceId: joi.number().required()
    });
    joi.assert(payload, schema);
}

async function getProvince(req, res) {
    const provinceId = req.params.provinceId;

    try {
        await validate({ provinceId });
    } catch (e) {
        console.error(e);
        return res.status(400).send("Data are not valid");
    }

    let connection;
    try {
        connection = await mysqlPool.getConnection();
        const sqlQuery = `SELECT * 
                          FROM provinces 
                          WHERE id=?`;
        const [rows] = await connection.execute(sqlQuery, [provinceId]);
        connection.release();
        if (rows.length === 0) {
            return res.status(404).send("Province not found");
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

module.exports = getProvince;
