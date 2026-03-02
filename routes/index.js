const express = require("express")

const index = express()


const adminRoute = require("./admin/admin.routes")


index.use("/admin", adminRoute)


module.exports = index