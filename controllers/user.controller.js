const User = require("../models/User");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//============= Register User ===============

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, fleetId } = req.body;

    if (!req.user || !req.user._id) {
      return res
        .status(401)
        .json({ status: false, message: "Un -Authenticated user" });
    }

    if (req.user.role !== "SUPER_ADMIN" || req.user.role !== "FLEET_ADMIN") {
      return res
        .status(403)
        .json({ status: false, message: "unauthorized user" });
    }

    if (req.user.role == "SUPER_ADMIN") {
      if (!fleetId) {
        return res
          .status(400)
          .json({ status: false, message: "FleetId is required" });
      }
    }

    if (req.user.role === "FLEET_ADMIN") {
      if (!fleetId) {
        return res
          .status(400)
          .json({ status: false, message: "FleetId is required" });
      }

      if (req.user.role !== "USER") {
        return res
          .status(400)
          .json({ status: false, message: "invalid ROLE input" });
      }
    }

    if (!name || name.trim() == "" || typeof name !== "string") {
      return res.status(400).json({
        status: false,
        message: "name is required and it should be non empty string",
      });
    }

    if (!email || email.trim() == "" || typeof email !== "string") {
      return res.status(400).json({
        status: false,
        message: "email is required and it should be non empty string",
      });
    }

    if (!password || password.trim() == "" || typeof password !== "string") {
      return res.status(400).json({
        status: false,
        message: "password is required and it should be non empty string",
      });
    }

    // Checking if user with the same email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ status: false, message: "Email already in use" });
    }

    // password hashing
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Creating new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      fleetId,
    });

    await newUser.save();

    return res.status(201).json({
      status: true,
      message: "User created successfully",
      data: newUser,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

//================== LogIn User =============

exports.logInUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ status: false, message: "Invalid password" });
    }

    // jwt token generation
    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET,
    );

    // Update last login time
    user.lastLoginAt = new Date();

    await user.save();

    return res
      .status(200)
      .json({ status: true, message: "Login successful", token: token });
  } catch (error) {
    console.error("Error logging in user:", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

// =============== Get Profile ==========

exports.profile = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res
        .status(401)
        .json({ status: false, message: "Un -Authenticated user" });
    }
    return res.status(200).json({
      status: false,
      message: "Profile data retrived successfully",
      data: req.user,
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};
