"use strict";

const express = require("express");
const checkAccountSession = require("../controllers/account/check-account-session");
const createReview = require("../controllers/review/create-review-controller");
const deleteReview = require("../controllers/review/delete-review-controller");
const getReview = require("../controllers/review/get-review-controller");

const router = express.Router();

router.delete("/v1/reviews/:reviewId", checkAccountSession, deleteReview);
router.get("/v1/reviews/:reviewId", getReview);
router.post("/v1/reviews", checkAccountSession, createReview);

module.exports = router;