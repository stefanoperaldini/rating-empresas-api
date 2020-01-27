'use strict';

const bcrypt = require("bcrypt");
const mysqlPool = require('../../../database/mysql-pool');
const uuidV4 = require("uuid/v4");
const { sendEmailPassword, validateEmail } = require("./utility");

async function passwordRecovery(req, res, next) {

    const accountData = { ...req.body };

    try {
        await validateEmail(accountData);
    } catch (e) {
        console.error(e);
        return res.status(400).send("Data are not valid");
    }

    const newPassword = uuidV4().replace(/-/g, '');

    const now = new Date()
        .toISOString()
        .substring(0, 19)
        .replace("T", " ");
    const securePwd = await bcrypt.hash(newPassword, 10);

    let connection;
    try {
        connection = await mysqlPool.getConnection();

        const sqlUpdateUser = `UPDATE users
                                SET password = ?,
                                modified_at = ?
                                WHERE email = ? AND deleted_at IS NULL AND activated_at IS NOT NULL`;

        const [updateStatus] = await connection.execute(sqlUpdateUser, [
            securePwd,
            now,
            accountData.email,
        ]);
        connection.release();

        if (updateStatus.changedRows !== 1) {
            return res.status(404).send("User not found");
        }

        try {
            await sendEmailPassword(accountData.email, newPassword);
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

module.exports = passwordRecovery;
