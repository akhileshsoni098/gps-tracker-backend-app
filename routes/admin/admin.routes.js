const express = require("express")

const admin = express()


const adminRoute = require("./adminAuth.routes")

const adminFleetRoute = require("./fleet.routes")

const adminDevicePurchaseEntry = require("./devicePurchase.routes")

const adminCompanyLedgerRoute = require("./companyLedger.routes")


admin.use("/", adminRoute)

admin.use("/fleet", adminFleetRoute)

admin.use("/device/purchase", adminDevicePurchaseEntry)

admin.use("/device/ledger", adminCompanyLedgerRoute)




module.exports = admin