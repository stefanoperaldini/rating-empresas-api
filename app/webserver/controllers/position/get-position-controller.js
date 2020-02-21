"use strict";

const Joi = require("@hapi/joi");
const mysqlPool = require("../../../database/mysql-pool");

async function validate(payload) {
    const schema = Joi.object({
        positionId: Joi.string()
            .guid({
                version: ["uuidv4"]
            })
            .required()
    });

    Joi.assert(payload, schema);
}

async function getPosition(req, res) {
    const positionId = req.params.positionId;

    try {
        await validate({ positionId });
    } catch (e) {
        console.error(e);
        return res.status(400).send("Data are not valid");
    }

    try {
        const connection = await mysqlPool.getConnection();
        const getPositionQuery = `SELECT id, name 
                                    FROM positions
                                    WHERE id = ?`;
        const [results] = await connection.execute(getPositionQuery, [positionId]);
        connection.release();
        if (results.length === 0) {
            return res.status(404).send("Position not found");
        }

        return res.send(results[0]);
    } catch (e) {
        console.error(e);
        return res.status(500).send();
    }
}

module.exports = getPosition;
