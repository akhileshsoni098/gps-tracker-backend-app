const express = require("express");
const {
  authenticateToken,
  authorizationAdmin,
} = require("../../middlewares/auth.middleware");
const {
  logInUser,
  profile,
  createUser,
} = require("../../controllers/user.controller");

const router = express();

// create fleet and associated user of particular fleet

router
  .route("/register/users")
  .post(authenticateToken, authorizationAdmin, createUser);

  
router.route("/logIn").post(logInUser);

router.route("/profile").get(authenticateToken, authorizationAdmin, profile);

module.exports = router;
