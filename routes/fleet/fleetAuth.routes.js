const express = require("express");
const {
  authenticateToken,
  authorizationFleet,
} = require("../../middlewares/auth.middleware");
const {
  createUser,
  logInUser,
  profile,
} = require("../../controllers/admin/user.controller");
const {
  updateStatusFleetAndUser,
  getFleetUser,
} = require("../../controllers/fleet/fleet.controller");

const router = express.Router();

router.route("/logIn").post(logInUser);

router.route("/profile").get(authenticateToken, authorizationFleet, profile);

router.route("/users").post(authenticateToken, authorizationFleet, createUser);

router
  .route("/status")
  .put(authenticateToken, authorizationFleet, updateStatusFleetAndUser);

router.route("/users").get(authenticateToken, authorizationFleet, getFleetUser);

module.exports = router;
