"use strict";

const bcrypt = require("bcrypt");
const Joi = require("@hapi/joi");
const mysqlPool = require("../../../database/mysql-pool");
const uuidV4 = require("uuid/v4");
const { sendEmailRegistration } = require("../utility");

async function validate(payload) {
    const schema = Joi.object({
        name: Joi
            .string()
            .required(),
        email: Joi
            .string()
            .email()
            .required(),
        password: Joi
            .string()
            .regex(/^[a-zA-Z0-9]{3,30}$/)
            .required(),
        linkedin: Joi.string().allow("").uri(),
        role: Joi.number()
            .integer()
            .min(1)
            .max(2).required(),
    });
    Joi.assert(payload, schema);
}

async function addVerificationCode(uuid) {
    const verificationCode = uuidV4();
    const now = new Date();
    const createdAt = now.toISOString().substring(0, 19).replace('T', ' ');
    const sqlQuery = 'INSERT INTO users_activation SET ?';
    const connection = await mysqlPool.getConnection();

    await connection.query(sqlQuery, {
        id: uuid,
        verification_code: verificationCode,
        created_at: createdAt,
    });

    connection.release();

    return verificationCode;
}

async function createAccount(req, res, next) {
    /*
    * Role:
    * 0 admin
    * 1 user
    * 2 enterprise
    */
    const accountData = { ...req.body };
    try {
        await validate(accountData);
    } catch (e) {
        console.error(e);
        return res.status(400).send("Data are not valid");
    }

    const createdAt = new Date()
        .toISOString()
        .substring(0, 19)
        .replace("T", " ");
    const userId = uuidV4();
    const securePwd = await bcrypt.hash(accountData.password, 10);

    let connection;
    try {
        connection = await mysqlPool.getConnection();
        await connection.query("INSERT INTO users SET ?", {
            id: userId,
            name: accountData.name,
            email: accountData.email,
            password: securePwd,
            linkedin: accountData.linkedin,
            role: accountData.role,
            created_at: createdAt
        });
        connection.release();

        const verificationCode = await addVerificationCode(userId);

        try {
            await sendEmailRegistration(accountData.email, verificationCode);
        } catch (e) {
            console.error(e);
        }
        return res.status(201).send();
    } catch (e) {
        if (connection) {
            connection.release();
        }

        if (e.code === "ER_DUP_ENTRY") return res.status(409).send("User already exists");

        console.error(e);
        return res.status(500).send();
    }
}

module.exports = createAccount;
