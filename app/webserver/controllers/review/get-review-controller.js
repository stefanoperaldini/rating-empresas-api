"use strict";

const Joi = require("@hapi/joi");
const mysqlPool = require("../../../database/mysql-pool");

async function getReview(req, res, next) {
    return res.send("GET REVIEW");
}

module.exports = getReview;
