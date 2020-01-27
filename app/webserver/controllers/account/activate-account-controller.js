'use strict';

const mysqlPool = require('../../../database/mysql-pool');

async function activate(req, res, next) {
    const verification_code = req.params.verification_code;

    if (!verification_code) {
        return res.status(400).send('Invalid verification code');
    }

    const now = new Date();
    const sqlActivateQuery = `UPDATE users_activation
                                SET verified_at = '${now.toISOString().substring(0, 19).replace('T', ' ')}'
                                WHERE verification_code='${verification_code}'
                                AND verified_at IS NULL`;

    try {
        const connection = await mysqlPool.getConnection();
        const result = await connection.query(sqlActivateQuery);

        if (result[0].affectedRows === 1) {
            const sqlActivateUserQuery = `UPDATE users u
                JOIN users_activation uv
                ON u.id = uv.id
                AND u.activated_at IS NULL
                AND uv.verification_code = '${verification_code}'
                SET u.activated_at = uv.verified_at`;

            const resultActivateUser = await connection.query(sqlActivateUserQuery);
            if (resultActivateUser[0].affectedRows === 1) {
                connection.release();
                return res.send('Account activated');
            }
        }
        // algo no fue ok
        connection.release();
        return res.status(404).send('Account activated error');
    } catch (e) {
        console.error(e);
        return res.status(500).send();
    }
}

module.exports = activate;
