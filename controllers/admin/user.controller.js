const User = require("../../models/User");

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

    if (req.user.role !== "SUPER_ADMIN" && req.user.role !== "FLEET_ADMIN") {
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
      const fleetCheck = await User.findOne({
        fleetId: fleetId,
        _id: req.user._id,
      });
      if (!fleetCheck) {
        return res
          .status(403)
          .json({ status: false, message: "unauthorized-user" });
      }

      if (fleetCheck.status !== "ACTIVE") {
        return res.status(400).json({
          status: false,
          message: `your current status is:${fleetCheck.status} it should be in "ACTIVE"`,
        });
      }

      if (role !== "USER") {
        return res.status(400).json({ status: false, message: "Invalid role" });
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
      status: true,
      message: "Profile data retrived successfully",
      data: req.user,
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

//==================== update user profile ==============

exports.updateProfileUser = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, email, password, fleetId, role, status } = req.body;

    const updateData = {};

    if (name) {
      if (typeof name !== "string" || name.trim() === "") {
        return res
          .status(400)
          .json({ status: false, message: "Name should be non empty string" });
      }
      updateData.name = name;
    }
    if (role) {
      if (typeof role !== "string" || role.trim() === "") {
        return res
          .status(400)
          .json({ status: false, message: "Role should be non empty string" });
      }
      updateData.role = role;
    }

    if (status !== undefined && status !== null) {
      const validStatuses = ["ACTIVE", "INACTIVE", "BLOCKED", "DELETED"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          status: false,
          message: `Status should be one of the following: ${validStatuses.join(
            ", ",
          )}`,
        });
      }
      updateData.status = status;
    }

    if (fleetId) {
      updateData.fleetId = fleetId;
    }

    if (email) {
      if (typeof email !== "string" || email.trim() === "") {
        return res
          .status(400)
          .json({ status: false, message: "Email should be non empty string" });
      }
      updateData.email = email;
    }

    if (password) {
      if (typeof password !== "string" || password.trim() === "") {
        return res.status(400).json({
          status: false,
          message: "Password should be non empty string",
        });
      }
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      updateData.password = hashedPassword;
    }
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      {
        returnDocument: "after",
      },
    ).select({ password: 0 });

    return res.status(200).json({
      status: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (err) {
    console.error("Error updating profile:", err);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

//======= Get All Registered Fleet ======

exports.getAllRegisteredFleet = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;

    const { name, status } = req.query;

    const filter = {
      role: "FLEET_ADMIN",
    };

    if (name && typeof name === "string" && name.trim()) {
      filter.name = {
        $regex: name.trim(),
        $options: "i",
      };
    }

    // Status validation
    if (status) {
      const validStatuses = ["ACTIVE", "INACTIVE", "BLOCKED", "DELETED"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          status: false,
          message: `Status must be one of: ${validStatuses.join(", ")}`,
        });
      }
      filter.status = status;
    }

    const [users, totalUsers] = await Promise.all([
      User.find(filter)
        .select("-password")
        .populate("fleetId", "name meta")
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    return res.status(200).json({
      status: true,
      message: "Fleet admins retrieved successfully",
      data: users,
      pagination: {
        totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
        currentPage: page,
      },
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};

//=============== get Single Registered Fleet ===============

exports.getSingleRegisteredFleet = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findOne({ _id: id, role: "FLEET_ADMIN" }).populate(
      "fleetId",
      "name meta",
    );

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "Fleet admin not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Fleet admin retrieved successfully",
      data: user,
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

//================== get particular fleet user ==============

exports.getParticularFleetUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.find({ fleetId: id, role: "USER" }).populate(
      "fleetId",
      "name meta",
    );

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "Fleet user not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Fleet user retrieved successfully",
      data: user,
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};
