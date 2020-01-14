"use strict";

const Joi = require("@hapi/joi");
const uuidV4 = require("uuid/v4");
const mysqlPool = require("../../../database/mysql-pool");

const httpServerDomain = process.env.HTTP_SERVER_DOMAIN;

async function createReview(req, res, next) {
    return res.status(201).send("CREATE REVIEW");
}

module.exports = createReview;
