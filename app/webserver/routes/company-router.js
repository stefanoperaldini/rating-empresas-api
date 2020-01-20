"use strict";

const express = require("express");
const multer = require("multer");
const checkAccountSession = require("../controllers/account/check-account-session");
const createCompany = require("../controllers/company/create-company-controller");
const getCompany = require("../controllers/company/get-company-controller");
const getCompanies = require("../controllers/company/get-companies-controller");
const updateCompanyData = require("../controllers/company/update-company-controller");
const uploadCompanyLogo = require("../controllers/company/upload-logo-company-controller");

const upload = multer();
const router = express.Router();

router.get("/v1/companies", getCompanies);
router.get("/v1/companies/:companyId", getCompany);
router.post("/v1/companies", checkAccountSession, createCompany);
router.post(
  "/v1/companies/logo",
  checkAccountSession,
  upload.single("logo"),
  uploadCompanyLogo
);
router.put("/v1/companies/:companyId", checkAccountSession, updateCompanyData);

module.exports = router;
