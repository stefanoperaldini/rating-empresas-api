"use strict";

const express = require("express");
const checkAccountSession = require("../controllers/account/check-account-session");
const createSector = require("../controllers/sector/create-sector-controller");
const getSector = require("../controllers/sector/get-sector-controller");
const getSectors = require("../controllers/sector/get-sectors-controller");

const router = express.Router();

router.get("/v1/sectors", getSectors);
router.get("/v1/sectors/:sectorId", getSector);
router.post("/v1/sectors", checkAccountSession, createSector);

module.exports = router;
