"use strict";

const accountRouter = require("./account-router");
const cityRouter = require("./city-router");
const companyRouter = require("./company-router");
const positionRouter = require("./position-router");
const reviewRouter = require("./review-router");
const sectorRouter = require("./sector-router");
const userRouter = require("./user-router");

module.exports = {
  accountRouter,
  cityRouter,
  companyRouter,
  positionRouter,
  reviewRouter,
  sectorRouter,
  userRouter
};
