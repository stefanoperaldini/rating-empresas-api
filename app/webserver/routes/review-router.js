"use strict";

const express = require("express");
const checkAccountSession = require("../controllers/account/check-account-session");
const checkRolePermission = require("../controllers/account/check-role-permission");
const createReview = require("../controllers/review/create-review-controller");
const deleteReview = require("../controllers/review/delete-review-controller");
const getReview = require("../controllers/review/get-review-controller");
const reportReview = require("../controllers/review/report-review-controller");

const router = express.Router();

router.delete("/v1/reviews/:reviewId", checkAccountSession, checkRolePermission("0"), deleteReview);
router.get("/v1/reviews/:reviewId", getReview);
router.post("/v1/reviews", checkAccountSession, checkRolePermission("1"), createReview);
router.post("/v1/reviews/blacklist/:reviewId", checkAccountSession, reportReview);

module.exports = router;