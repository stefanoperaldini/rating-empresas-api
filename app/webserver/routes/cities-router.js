"use strict";

const express = require("express");

const getCities = require("../controllers/city/get-cities-controller");
const getCity = require("../controllers/city/get-city-controller");
const getCitiesProvinceRegion = require("../controllers/city/get-cities-province-region-controller");

const router = express.Router();

router.get("/v1/cities", getCities);
router.get(
  "/v1/regions/:regionId/provinces/:provinceId/cities",
  getCitiesProvinceRegion
);
router.get(
  "/v1/regions/:regionId/provinces/:provinceId/cities/:cityId",
  getCity
);

module.exports = router;
