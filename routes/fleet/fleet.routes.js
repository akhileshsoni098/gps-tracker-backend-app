const express = require("express");

const fleet = express();

const fleetAuthRoute = require("./fleetAuth.routes");

const fleetVehicleRoute = require("./fleetVehicle.routes");

fleet.use("/fleet", fleetAuthRoute);

fleet.use("/fleet/vehicle", fleetVehicleRoute);

module.exports = fleet;
