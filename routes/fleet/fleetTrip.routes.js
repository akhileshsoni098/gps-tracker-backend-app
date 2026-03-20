const express = require("express");
const {
  authenticateToken,
  authorizationFleet,
} = require("../../middlewares/auth.middleware");
const {
  tripCreate,
  getAllTrips,
  updateTrip,
  getTripById,
} = require("../../controllers/fleet/trip.controller");

const router = express.Router();

router.route("/").post(authenticateToken, authorizationFleet, tripCreate);

router.route("/:id").put(authenticateToken, authorizationFleet, updateTrip);

router.route("/").get(authenticateToken, authorizationFleet, getAllTrips);

router.route("/:id").get(authenticateToken, authorizationFleet, getTripById);

module.exports = router;
