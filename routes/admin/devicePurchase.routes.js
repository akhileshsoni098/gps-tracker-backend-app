const express = require("express")
const { authenticateToken, authorizationAdmin } = require("../../middlewares/auth.middleware")
const { devicePurchaseEntry, getAllPurchasedDevices, deviceUpdateEntry } = require("../../controllers/admin/device.controller")

const router = express.Router()


router.route("/entry").post(authenticateToken,authorizationAdmin,devicePurchaseEntry)

router.route("/").get(authenticateToken,authorizationAdmin,getAllPurchasedDevices)

router.route("/:id").put(authenticateToken,authorizationAdmin,deviceUpdateEntry)


module.exports = router