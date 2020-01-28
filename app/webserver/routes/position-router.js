"use strict";

const express = require("express");
const checkAccountSession = require("../controllers/account/check-account-session");
const checkRolePermission = require("../controllers/account/check-role-permission");
const createPosition = require("../controllers/position/create-position-controller");
const getPosition = require("../controllers/position/get-position-controller");
const getPositions = require("../controllers/position/get-positions-controller");

const router = express.Router();

router.get("/v1/positions", getPositions);
router.get("/v1/positions/:positionId", getPosition);
router.post("/v1/positions", checkAccountSession, checkRolePermission("1"), createPosition);

module.exports = router;