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

async function getPosition(req, res, next) {
    const positionId = req.params.positionId;

    try {
        await validate({ positionId });
    } catch (e) {
        return res.status(400).send(e);
    }

    try {
        const connection = await mysqlPool.getConnection();
        const getPositionQuery = `SELECT id, name 
                                    FROM positions
                                    WHERE id = ?`;
        const [results] = await connection.execute(getPositionQuery, [positionId]);
        connection.release();
        if (results.length === 0) {
            return res.status(404).send();
        }

        const [positionData] = results;

        return res.send({
            data: positionData
        });
    } catch (e) {
        console.error(e);
        res.status(500).send({
            message: e.message
        });
    }
}

module.exports = getPosition;
