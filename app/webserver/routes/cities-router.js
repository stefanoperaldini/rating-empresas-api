"use strict";

const express = require("express");

const {
  getCities,
} = require("../controllers/city/get-cities-controller");

const router = express.Router();

router.get("/v1/cities", getCities);

module.exports = router;
