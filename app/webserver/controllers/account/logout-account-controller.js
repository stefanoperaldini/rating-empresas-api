'use strict';

const redis = require("redis");

async function logoutUser(req, res, next) {
    const { token } = req.claims;
    try {
        const clientRedis = redis.createClient();
        await clientRedis.set(`logout:${token}`, 'O', 'EX', process.env.REDIS_TTL);
    } catch (e) {
        console.error(e);
        return res.status(500).send();
    }
    return res.send();
}

module.exports = logoutUser;
