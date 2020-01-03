"use strict";

const bcrypt = require("bcrypt");
const Joi = require("@hapi/joi");
const mysqlPool = require("../../../database/mysql-pool");
const sendgridMail = require("@sendgrid/mail");
const uuidV4 = require("uuid/v4");

sendgridMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendMail(email) {
    const [username] = email.split("@");
    const msg = {
        to: email,
        from: "noreply.ratingempresas@mail.com",
        subject: "Welcome to RatingEmpresas",
        text: `Welcome ${username} to RatingEmpresas.`,
        html: `<strong>Welcome ${username} to RatingEmpresas.</strong>`
    };
    const data = await sendgridMail.send(msg);
    return data;
}

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
        return res.status(400).send(e);
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
        res.status(201).send();

        try {
            await sendMail(accountData.email);
        } catch (e) {
            console.log(e);
        }
    } catch (e) {
        if (connection) {
            connection.release();
        }
        console.log(e);
        if (e.code === "ER_DUP_ENTRY") res.status(409).send();

        return res.status(500).send();
    }
}

module.exports = createAccount;
