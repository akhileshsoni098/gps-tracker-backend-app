const express = require("express");

const fleet = express();

const fleetAuthRoute = require("./fleetAuth.routes");

fleet.use("/fleet", fleetAuthRoute);

module.exports = fleet;
