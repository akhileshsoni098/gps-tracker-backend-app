const User = require("../models/User");

const jwt = require("jsonwebtoken");

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

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(400).json({ status: false, message: "user not found" });
    }

    if (user.role !== "SUPER_ADMIN") {
      return res
        .status(403)
        .json({ status: false, message: "Unauthorized user" });
    }

    next();
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};
