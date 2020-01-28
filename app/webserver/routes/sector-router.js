"use strict";

const express = require("express");
const checkAccountSession = require("../controllers/account/check-account-session");
const checkRolePermission = require("../controllers/account/check-role-permission");
const createSector = require("../controllers/sector/create-sector-controller");
const getSector = require("../controllers/sector/get-sector-controller");
const getSectors = require("../controllers/sector/get-sectors-controller");

const router = express.Router();

router.get("/v1/sectors", getSectors);
router.get("/v1/sectors/:sectorId", getSector);
router.post("/v1/sectors", checkAccountSession, checkRolePermission("1", "2"), createSector);

module.exports = router;
