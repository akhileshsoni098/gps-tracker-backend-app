
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

// authentication admin user

exports.authenticateToken = async (req, res, next) => {
  try {
    const token = req.headers["x-auth-token"];

    if (!token) {
      return res
        .status(401)
        .json({ status: false, message: "Access token missing" });
    }

    jwt.verify(token, process.env.JWT_SECRET, async function (err, user) {
      if (err) {
        return res
          .status(403)
          .json({ status: false, message: "Invalid access token" });
      }

      const userData = await User.findById(user._id).select({ password: 0 });
      if (!userData) {
        return res
          .status(404)
          .json({ status: false, message: "user not found" });
      }

      req.user = userData;

      next();
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

// authorization middileware

exports.authorizationAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return res
        .status(401)
        .json({ status: false, message: "Un-Authenticated user" });
    }

    if (req.user.role !== "SUPER_ADMIN") {
      return res
        .status(403)
        .json({ status: false, message: "Unauthorized user" });
    }

    next();
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

//================= authorization fleet =============

exports.authorizationFleet = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return res
        .status(401)
        .json({ status: false, message: "Un-Authenticated user" });
    }

    const unAllowedFleetStatus = ["BLOCKED", "DELETED"];

    if (unAllowedFleetStatus.includes(req.user.status)) {
      return res.status(400).json({
        status: false,
        message: `your are in ${req.user.status} state`,
      });
    }

    if (req.user.role !== "FLEET_ADMIN") {
      return res
        .status(403)
        .json({ status: false, message: "Unauthorized user" });
    }

    next();
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

//================== user authorization ===============

exports.authorizationUser = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return res
        .status(401)
        .json({ status: false, message: "Un-Authenticated user" });
    }

    const unAllowedFleetStatus = ["BLOCKED", "DELETED"];

    if (unAllowedFleetStatus.includes(req.user.status)) {
      return res.status(400).json({
        status: false,
        message: `your are in ${req.user.status} state`,
      });
    }

    if (req.user.role !== "USER") {
      return res
        .status(403)
        .json({ status: false, message: "Unauthorized user" });
    }

    next();
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};
