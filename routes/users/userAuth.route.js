const express = require("express");
const { logInUser, profile } = require("../../controllers/admin/user.controller");
const { updateStatusUser } = require("../../controllers/user/userAuth.controllers");
const { authorizationUser, authenticateToken } = require("../../middlewares/auth.middleware");

const router = express.Router();

router.route("/logIn").post(logInUser);

router.route("/profile").get(authenticateToken, authorizationUser, profile);

router
  .route("/status")
  .put(authenticateToken, authorizationUser, updateStatusUser);

module.exports = router;
