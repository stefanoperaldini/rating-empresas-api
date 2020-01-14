'use strict';

const mysqlPool = require('../../../database/mysql-pool');

async function deleteReview(req, res, next) {
    return res.status(204).send("DELETE REVIEW");
}

module.exports = deleteReview;
