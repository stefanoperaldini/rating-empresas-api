"use strict";
const express = require("express");

const {
  cityRouter,
} = require("./routes");

const app = express();

app.use(express.json());
app.use("/", cityRouter);


let server = null;
async function listen(port) {
  if (server) {
    return server;
  }

  try {
    server = await app.listen(port);
    return server;
  } catch (err) {
    console.log(err);
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
