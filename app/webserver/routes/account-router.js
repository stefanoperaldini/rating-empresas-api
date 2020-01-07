"use strict";

const express = require("express");
const checkAccountSession = require("../controllers/account/check-account-session");
const createAccount = require("../controllers/account/create-account-controller");
const login = require("../controllers/account/login-controller");
const activate = require("../controllers/account/activate-account-controller")
const passwordRecovery = require("../controllers/account/password-recovery-controller");
const changePassword = require("../controllers/account/change-password-controllers");
const newActivationEmail = require("../controllers/account/new-activation-email-controller")

const router = express.Router();

router.post("/v1/accounts", createAccount);
router.post("/v1/accounts/login", login);
router.get("/v1/accounts/activate", activate);
router.put("/v1/accounts/passwordrecovery", passwordRecovery)
router.put("/v1/accounts/changepassword", checkAccountSession, changePassword)
router.put("/v1/accounts/newactivationemail", newActivationEmail)

module.exports = router;