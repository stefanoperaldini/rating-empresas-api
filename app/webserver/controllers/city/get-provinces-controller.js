"use strict";

const mysqlPool = require("../../../database/mysql-pool");

async function getProvinces(req, res) {
    let connection;
    try {
        connection = await mysqlPool.getConnection();
        const sqlQuery = "SELECT * FROM provinces ORDER BY name;";
        const [rows] = await connection.execute(sqlQuery);
        connection.release();
        res.send(rows);
    } catch (e) {
        if (connection) {
            connection.release();
        }
        console.error(e);
        return res.status(500).send();
    }
}

module.exports = getProvinces;
