'use strict';

const Joi = require('@hapi/joi');
const bcrypt = require("bcrypt");
const mysqlPool = require('../../../database/mysql-pool');
const { sendEmailPassword } = require("./utility");

async function validate(payload) {
    const schema = Joi.object({
        email: Joi
            .string()
            .email()
            .required(),
        oldPassword: Joi
            .string()
            .regex(/^[a-zA-Z0-9]{3,36}$/)
            .required(),
        newPassword: Joi
            .string()
            .regex(/^[a-zA-Z0-9]{3,36}$/)
            .required(),
        confirmationPassword: Joi
            .string()
            .regex(/^[a-zA-Z0-9]{3,36}$/)
            .required(),
    });
    Joi.assert(payload, schema);
}

async function changePassword(req, res, next) {

    const accountData = { ...req.body };

    try {
        await validate(accountData);
    } catch (e) {
        console.error(e);
        return res.status(400).send("Data are not valid");
    }

    const now = new Date()
        .toISOString()
        .substring(0, 19)
        .replace("T", " ");
    const securePwd = await bcrypt.hash(accountData.newPassword, 10);

    const sqlQuery =
        `SELECT id, email, password, activated_at, role  
         FROM users WHERE email = ? AND deleted_at IS NULL`;

    let connection;
    try {
        connection = await mysqlPool.getConnection();

        const [rows] = await connection.query(sqlQuery, [accountData.email]);


        if (rows.length !== 1) {
            return res.status(404).send("User not found");
        }

        const user = rows[0];

        const isPasswordOk = await bcrypt.compare(accountData.oldPassword, user.password);
        if (!isPasswordOk) {
            return res.status(401).send("Old password not correct");
        }

        if (accountData.newPassword !== accountData.confirmationPassword) {
            return res.status(400).send("Confirmation password no correct");
        } else if (accountData.oldPassword === accountData.newPassword) {
            return res.status(400).send("Password reuse not permitted");
        }

        const securePwd = await bcrypt.hash(accountData.newPassword, 10);

        const sqlUpdateUser = `UPDATE users
                                SET password = ?,
                                modified_at = ?
                                WHERE email = ?`;

        const [updateStatus] = await connection.execute(sqlUpdateUser, [
            securePwd,
            now,
            accountData.email,
        ]);
        connection.release();

        if (updateStatus.changedRows !== 1) {
            return res.status(404).send("Update password error");
        }

        connection.release();

        try {
            await sendEmailPassword(accountData.email, null);
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

module.exports = changePassword;
