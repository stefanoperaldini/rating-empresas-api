'use strict';

const mysqlPool = require('../../../database/mysql-pool');
const { sendEmailRegistration, validateEmail } = require("../utility");

async function newActivationEmail(req, res, next) {

    const accountData = { ...req.body };

    try {
        await validateEmail(accountData);
    } catch (e) {
        console.error(e);
        return res.status(400).send("Data are not valid");
    }

    const sqlQuery =
        `SELECT u.id, u.email, u.password, uv.verification_code  
         FROM users u 
         JOIN users_activation uv ON u.id = uv.id AND u.activated_at IS NULL
         WHERE email = ? AND deleted_at IS NULL`;

    let connection;
    try {
        connection = await mysqlPool.getConnection();
        const [rows] = await connection.query(sqlQuery, [accountData.email]);
        connection.release();
        if (rows.length !== 1) {
            return res.status(404).send("User not found or already activated");
        }

        const user = rows[0];

        try {
            await await sendEmailRegistration(accountData.email, user.verification_code);
        } catch (e) {
            console.error(e);
        }

        return res.send();
    } catch (e) {
        if (connection) {
            connection.release();
        }
        console.error(e);
        return res.status(500).send();
    }
}

module.exports = newActivationEmail;
