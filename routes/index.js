const express = require("express");

const index = express();

const adminRoute = require("./admin/admin.routes");

const fleetRoute = require("./fleet/fleet.routes");

const userRoute = require("./users/user.route")


index.use("/admin", adminRoute);

index.use("/", fleetRoute);

index.use("/", userRoute);

module.exports = index;
