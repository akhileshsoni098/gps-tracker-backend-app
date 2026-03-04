const express = require("express");
const {
  authenticateToken,
  authorizationAdmin,
} = require("../../middlewares/auth.middleware");
const { createCompanyLedger, getAllLedgerEntries, updateLedgerEntry } = require("../../controllers/admin/companyLedger.controller");

const router = express.Router();

router.route("/:id").post(authenticateToken, authorizationAdmin,createCompanyLedger);

router.route("/").get(authenticateToken, authorizationAdmin, getAllLedgerEntries);

router.route("/:id").put(authenticateToken, authorizationAdmin,updateLedgerEntry);

module.exports = router;
