"use strict";

const uuidV4 = require("uuid/v4");
const Joi = require("@hapi/joi");
const mysqlPool = require("../../../database/mysql-pool");

async function validateSchema(payload) {
    const schema = Joi.object({
        name: Joi.string()
            .min(1)
            .max(60)
            .required(),
    });

    Joi.assert(payload, schema);
}

async function createPosition(req, res, next) {
    const positionData = { ...req.body };

    try {
        await validateSchema(positionData);
    } catch (e) {
        return res.status(400).send(e);
    }

    const id = uuidV4();
    const position = {
        id,
        name: positionData.name,
    };

    let connection;
    try {
        connection = await mysqlPool.getConnection();
        const sqlQuery = `INSERT INTO positions SET ?`;
        await connection.query(sqlQuery, position);
        connection.release();

        res.header(
            "Location",
            `${process.env.HTTP_SERVER_DOMAIN}/v1/positions/${position.id}`
        );
        return res.status(201).send();
    } catch (e) {
        if (connection) {
            connection.release();
        }

        if (e.code === "ER_DUP_ENTRY") {
            return res.status(409).send();
        }

        console.error(e);
        return res.status(500).send();
    }
}

module.exports = createPosition;
