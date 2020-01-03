'use strict';

const Joi = require('@hapi/joi');
const bcrypt = require("bcrypt");
const mysqlPool = require('../../../database/mysql-pool');

async function validate(payload) {
    const schema = Joi.object({
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

async function updateNote(req, res, next) {
    const { userId } = req.claims;

    // añadir OLD Password control?
    const accountData = { ...req.body };

    try {
        await validate(accountData);
    } catch (e) {
        console.error(e);
        return res.status(400).send(e);
    }

    const now = new Date()
        .toISOString()
        .substring(0, 19)
        .replace("T", " ");
    const securePwd = await bcrypt.hash(accountData.password, 10);

    let connection;
    try {
        connection = await mysqlPool.getConnection();

        const sqlUpdateUser = `UPDATE users
                                SET password = ?,
                                linkedin = ?,
                                role = ?,
                                modified_at = ?
                                WHERE id = ? AND deleted_at IS NULL`;

        const [updateStatus] = await connection.execute(sqlUpdateUser, [
            securePwd,
            accountData.linkedin,
            accountData.role,
            now,
            userId,
        ]);
        connection.release();

        if (updateStatus.changedRows !== 1) {
            return res.status(404).send();
        }

        return res.status(204).send();
    } catch (e) {
        if (connection) {
            connection.release();
        }

        console.error(e);
        return res.status(500).send(e.message);
    }
}

module.exports = updateNote;
