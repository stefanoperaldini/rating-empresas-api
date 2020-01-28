'use strict'

const express = require("express");
const router = express.Router();
const checkAccountSession = require("../controllers/account/check-account-session");
const checkRolePermission = require("../controllers/account/check-role-permission");
const deleteUser = require("../controllers/user/delete-user-controller");
const updateUser = require("../controllers/user/update-user-controller");
const getUser = require("../controllers/user/get-user-controller");

router.delete("/v1/users", checkAccountSession, checkRolePermission("1", "2"), deleteUser);
router.put("/v1/users", checkAccountSession, updateUser);
router.get("/v1/users", checkAccountSession, getUser);

module.exports = router;
