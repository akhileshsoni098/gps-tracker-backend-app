const express = require("express");

const fleet = express();

const fleetAuthRoute = require("./fleetAuth.routes");

const fleetVehicleRoute = require("./fleetVehicle.routes");

const fleetTripRoute = require("./fleetTrip.routes");

fleet.use("/fleet", fleetAuthRoute);

fleet.use("/fleet/vehicle", fleetVehicleRoute);

fleet.use("/fleet/trip", fleetTripRoute);

module.exports = fleet;
