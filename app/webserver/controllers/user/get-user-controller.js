'use strict';

const mysqlPool = require('../../../database/mysql-pool');

async function getUser(req, res) {
    const { userId } = req.claims;

    let connection;
    try {
        connection = await mysqlPool.getConnection();
        const sqlQuery = "SELECT id, name, email, linkedin, role  FROM users WHERE id = ? AND deleted_at IS NULL";
        const [rows] = await connection.execute(sqlQuery, [userId]);
        connection.release();

        if (rows.length !== 1) {
            return res.status(404).send("User not found");
        }

        return res.send(rows[0]);
    } catch (e) {
        if (connection) {
            connection.release();
        }
        console.error(e);
        return res.status(500).send();
    }
}

module.exports = getUser;
