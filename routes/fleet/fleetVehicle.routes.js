const express = require("express");
const {
  vehicleCreate,
  vehicleUpdate,
  getFleetVehicles,
} = require("../../controllers/fleet/fleetVehicle.controller");
const {
  authenticateToken,
  authorizationFleet,
} = require("../../middlewares/auth.middleware");

const router = express.Router();

router.route("/").post(authenticateToken, authorizationFleet, vehicleCreate);

router.route("/:id").put(authenticateToken, authorizationFleet,vehicleUpdate);

router.route("/").get(authenticateToken, authorizationFleet,getFleetVehicles);

module.exports = router;
 