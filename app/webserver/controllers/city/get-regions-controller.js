"use strict";

const mysqlPool = require("../../../database/mysql-pool");

async function getRegions(req, res) {
    let connection;
    try {
        connection = await mysqlPool.getConnection();
        const sqlQuery = "SELECT * FROM regions ORDER BY name;";
        const [rows] = await connection.query(sqlQuery);
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


module.exports = getRegions;
