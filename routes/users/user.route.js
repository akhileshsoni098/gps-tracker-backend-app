const express = require("express");

const user = express();

const userAuthRoute = require("./userAuth.route");

user.use("/user", userAuthRoute);

module.exports = user;
