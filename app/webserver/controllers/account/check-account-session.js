"use strict";

const jwt = require("jsonwebtoken");
const redis = require("redis");

async function checkAccountSession(req, res, next) {
    const { authorization } = req.headers;
    if (!authorization) {
        return res.status(401).send("Authorization error");
    }

    const [prefix, token] = authorization.split(" ");
    if (prefix !== "Bearer" || !token) {
        return res.status(401).send("Authorization error");
    }

    try {
        const { userId, role } = jwt.verify(token, process.env.AUTH_JWT_SECRET);

        req.claims = {
            userId,
            role,
            token,
        };
    } catch (e) {
        console.error(e);
        return res.status(401).send("Authorization error");
    }

    try {
        const clientRedis = await redis.createClient();

        clientRedis.get(`logout:${token}`, (err, result) => {
            // key exist in Redis store
            if (result) {
                return res.status(401).send("Unauthorized");
            }
            if (err) {
                console.error(err);
                return res.status(500).send();
            }
            next();
        });
    } catch (e) {
        console.error(e.message);
        return res.status(500).send();
    }
}

module.exports = checkAccountSession;
