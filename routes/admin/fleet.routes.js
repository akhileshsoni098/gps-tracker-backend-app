const express = require("express");
const {
  authenticateToken,
  authorizationAdmin,
} = require("../../middlewares/auth.middleware");
const {
  createFleet,
  updateFleet,
  getAllFleet,
  getFleetById,
} = require("../../controllers/fleet.controller");

const router = express.Router();

router
  .route("/create")
  .post(authenticateToken, authorizationAdmin, createFleet);

router
  .route("/update/:id")
  .put(authenticateToken, authorizationAdmin, updateFleet);

router.route("/").get(authenticateToken, authorizationAdmin, getAllFleet);

router.route("/:id").get(authenticateToken, authorizationAdmin, getFleetById);

module.exports = router;
