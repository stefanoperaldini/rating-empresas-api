"use strict";

const express = require("express");

const getCities = require("../controllers/city/get-cities-controller");
const getCity = require("../controllers/city/get-city-controller");
const getCitiesProvinceRegion = require("../controllers/city/get-cities-province-region-controller");
const getRegions = require("../controllers/city/get-regions-controller");
const getRegion = require("../controllers/city/get-region-controller");
const getProvinces = require("../controllers/city/get-provinces-controller");
const getProvince = require("../controllers/city/get-province-controller");
const getProvincesRegion = require("../controllers/city/get-provinces-region-controller");

const router = express.Router();

router.get("/v1/cities", getCities);
router.get("/v1/cities/:cityId", getCity);
router.get(
  "/v1/regions/:regionId/provinces/:provinceId/cities",
  getCitiesProvinceRegion
);
router.get("/v1/regions", getRegions);
router.get("/v1/regions/:regionId", getRegion);

router.get("/v1/provinces", getProvinces);
router.get("/v1/provinces/:provinceId", getProvince);
router.get("/v1/regions/:regionId/provinces", getProvincesRegion);

module.exports = router;
