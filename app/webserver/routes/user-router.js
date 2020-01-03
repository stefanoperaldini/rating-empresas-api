'use strict'

const express = require("express");
const router = express.Router();
const checkAccountSession = require("../controllers/account/check-account-session");
const deleteUser = require("../controllers/user/delete-user-controller");
const modifyUser = require("../controllers/user/modify-user-controller");
const getUser = require("../controllers/user/get-user-controller");

router.delete("/v1/users", checkAccountSession, deleteUser);
router.post("/v1/users", checkAccountSession, modifyUser);
router.get("/v1/users", checkAccountSession, getUser);

module.exports = router;
