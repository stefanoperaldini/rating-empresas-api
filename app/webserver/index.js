"use strict";
const express = require("express");
const initApp = require("./initApp");
const cors = require("cors");

const {
  accountRouter,
  cityRouter,
  companyRouter,
  positionRouter,
  reviewRouter,
  sectorRouter,
  userRouter
} = require("./routes");

initApp(); //application setting (create account admin if no exist)

const app = express();
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  const accessControlAllowHeaders = [
    'Location'
  ];

  res.header('Access-Control-Allow-Headers', accessControlAllowHeaders.join(','));
  res.header('Access-Control-Expose-Headers', accessControlAllowHeaders.join(','));
  next();
});
app.use("/", accountRouter);
app.use("/", cityRouter);
app.use("/", companyRouter);
app.use("/", positionRouter);
app.use("/", reviewRouter);
app.use("/", sectorRouter);
app.use("/", userRouter);

let server = null;
async function listen(port) {
  if (server) {
    return server;
  }

  try {
    server = await app.listen(port);
    return server;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function close() {
  if (server) {
    await server.close();
    server = null;
  } else {
    console.error("Can not close a non started server");
  }
}

module.exports = { listen, close };
