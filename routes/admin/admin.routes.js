const express = require("express")

const admin = express()


const adminRoute = require("./adminAuth.routes")

const adminFleetRoute = require("./fleet.routes")

admin.use("/", adminRoute)

admin.use("/fleet", adminFleetRoute)



module.exports = admin