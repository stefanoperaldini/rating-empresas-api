"use strict";

const express = require("express");
const multer = require("multer");
const checkAccountSession = require("../controllers/account/check-account-session");
const checkRolePermission = require("../controllers/account/check-role-permission");
const createCompany = require("../controllers/company/create-company-controller");
const getCompany = require("../controllers/company/get-company-controller");
const getCompanies = require("../controllers/company/get-companies-controller");
const updateCompanyData = require("../controllers/company/update-company-controller");
const uploadCompanyLogo = require("../controllers/company/upload-logo-company-controller");

const upload = multer();
const router = express.Router();

router.get("/v1/companies", getCompanies);
router.get("/v1/companies/:companyId", getCompany);
router.post("/v1/companies", checkAccountSession, checkRolePermission("1", "2"), createCompany);
router.post(
  "/v1/companies/logo",
  checkAccountSession,
  checkRolePermission("2"),
  upload.single("logo"),
  uploadCompanyLogo
);
router.put("/v1/companies/:companyId", checkAccountSession, checkRolePermission("2"), updateCompanyData);

module.exports = router;
