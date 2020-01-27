"use strict";

const express = require("express");
const checkAccountSession = require("../controllers/account/check-account-session");
const createAccount = require("../controllers/account/create-account-controller");
const login = require("../controllers/account/login-controller");
const activate = require("../controllers/account/activate-account-controller")
const passwordRecovery = require("../controllers/account/password-recovery-controller");
const changePassword = require("../controllers/account/change-password-controllers");
const newActivationEmail = require("../controllers/account/new-activation-email-controller");
const logoutUser = require("../controllers/account/logout-account-controller");

const router = express.Router();

router.post("/v1/accounts", createAccount);
router.post("/v1/accounts/login", login);
router.put("/v1/accounts/activate/:verification_code", activate);
router.post("/v1/accounts/password/recovery", passwordRecovery);
router.post("/v1/accounts/password/change", checkAccountSession, changePassword);
router.post("/v1/accounts/email/activation/recovery", newActivationEmail);
router.post("/v1/accounts/logout", checkAccountSession, logoutUser);


module.exports = router;