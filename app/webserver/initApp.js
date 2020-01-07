"use strict";

const uuidV4 = require("uuid/v4");
const bcrypt = require("bcrypt");
const mysqlPool = require("../database/mysql-pool");

async function initApp() {
    const now = new Date()
        .toISOString()
        .substring(0, 19)
        .replace("T", " ");
    const securePwd = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

    let connection;
    try {
        connection = await mysqlPool.getConnection();
        await connection.query("INSERT INTO users SET ?", {
            id: uuidV4(),
            name: "admin",
            email: "admin@email.com",
            password: securePwd,
            linkedin: "",
            role: 0,
            created_at: now,
            activated_at: now,
        });
        connection.release();
    } catch (e) {
        if (connection) {
            connection.release();
        }

        if (e.code != "ER_DUP_ENTRY") console.log(e);
    }
}

module.exports = initApp;
