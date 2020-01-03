"use strict";

const express = require("express");
const createAccount = require("../controllers/account/create-account-controller");
const login = require("../controllers/account/login-controller");

const router = express.Router();

router.post("/v1/accounts", createAccount);
router.post("/v1/accounts/login", login);

module.exports = router;