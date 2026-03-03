const express = require("express");
const {
  authenticateToken,
  authorizationAdmin,
} = require("../../middlewares/auth.middleware");
const {
  logInUser,
  profile,
  createUser,
  updateProfileUser,
  getAllRegisteredFleet,
  getSingleRegisteredFleet,
  getParticularFleetUser,
} = require("../../controllers/admin/user.controller");

const router = express();

// create fleet and associated user of particular fleet

router
  .route("/register/users")
  .post(authenticateToken, authorizationAdmin, createUser);
//============= log in user ===============
router.route("/logIn").post(logInUser);
//============= get super admin profile ====
router.route("/profile").get(authenticateToken, authorizationAdmin, profile);

//========= update user profile by super admin ====
router
  .route("/user/:id")
  .put(authenticateToken, authorizationAdmin, updateProfileUser);

//======== get all registered fleet admin ===========
router
  .route("/fleet-admins")
  .get(authenticateToken, authorizationAdmin, getAllRegisteredFleet);

//================ get single registered fleet admin ===============
router
  .route("/fleet-admins/:id")
  .get(authenticateToken, authorizationAdmin, getSingleRegisteredFleet);

//================ get particular fleet user ===============
router
  .route("/fleet-users/:id")
  .get(authenticateToken, authorizationAdmin, getParticularFleetUser);

module.exports = router;
