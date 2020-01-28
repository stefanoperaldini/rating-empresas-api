'use strict';

const { sendEmailReport } = require("../utility");

async function reportReview(req, res, next) {
    const { reviewId } = req.params;

    try {
        await sendEmailReport(reviewId);
    } catch (e) {
        console.error(e);
    }
    return res.send();
}

module.exports = reportReview;
