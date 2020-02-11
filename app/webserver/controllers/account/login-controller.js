"use strict";

const bcrypt = require("bcrypt");
const Joi = require("@hapi/joi");
const jwt = require("jsonwebtoken");
const mysqlPool = require("../../../database/mysql-pool");

async function validate(payload) {
    const schema = Joi.object({
        email: Joi
            .string()
            .email()
            .required(),
        password: Joi
            .string()
            .regex(/^[a-zA-Z0-9]{3,36}$/)
            .required()
    });

    Joi.assert(payload, schema);
}

async function login(req, res, next) {
    const accountData = { ...req.body };
    try {
        await validate(accountData);
    } catch (e) {
        console.error(e);
        return res.status(400).send("Data are not valid");
    }

    const sqlQuery =
        `SELECT id, email, password, activated_at, role  
         FROM users WHERE email = ? AND deleted_at IS NULL`;

    let connection;
    try {
        connection = await mysqlPool.getConnection();
        const [rows] = await connection.query(sqlQuery, [accountData.email]);
        connection.release();
        if (rows.length !== 1) {
            return res.status(404).send("User not found");
        }

        const user = rows[0];

        if (!user.activated_at) {
            return res.status(401).send("You need to confirm the verification link");
        }

        try {
            const isPasswordOk = await bcrypt.compare(accountData.password, user.password);
            if (!isPasswordOk) {
                return res.status(401).send("Incorrect password");
            }
        } catch (e) {
            return res.status(500).send();
        }

        const payloadJwt = {
            userId: user.id,
            role: user.role
        };

        const jwtExpiresIn = parseInt(process.env.AUTH_ACCESS_TOKEN_TTL);
        const token = jwt.sign(payloadJwt, process.env.AUTH_JWT_SECRET, {
            expiresIn: jwtExpiresIn
        });

        return res.send({
            accessToken: token,
            expiresIn: jwtExpiresIn
        });
    } catch (e) {
        if (connection) {
            connection.release();
        }
        console.error(e);
        return res.status(500).send();
    }
}

module.exports = login;
