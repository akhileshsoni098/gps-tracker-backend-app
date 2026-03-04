const { isValidObjectId } = require("mongoose");
const User = require("../../models/user.model");

//================ update Status user and self ========

exports.updateStatusFleetAndUser = async (req, res) => {
  try {
    const { userId, status } = req.body;

    if (!status || typeof status !== "string") {
      return res.status(400).json({
        status: false,
        message: "Please provide a valid status",
      });
    }

    // Allowed statuses
    const fleetAdminSelfStatus = ["ACTIVE", "INACTIVE"];
    const fleetAdminUserStatus = ["ACTIVE", "INACTIVE", "BLOCKED", "DELETED"];
    const superAdminStatus = ["ACTIVE", "INACTIVE", "BLOCKED", "DELETED"];

    // ===============================
    // 🔹 FLEET_ADMIN updating self
    // ===============================
    if (req.user.role === "FLEET_ADMIN" && !userId) {
      if (!fleetAdminSelfStatus.includes(status)) {
        return res.status(400).json({
          status: false,
          message: `Allowed status: ${fleetAdminSelfStatus.join(" | ")}`,
        });
      }

      const updated = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { status } },
        { returnDocument: "after" },
      ).select("-password");

      return res.status(200).json({
        status: true,
        message: "Status updated successfully",
        data: updated,
      });
    }

    // ====================================
    // 🔹 FLEET_ADMIN updating other user
    // ====================================
    if (req.user.role === "FLEET_ADMIN" && userId) {
      if (!isValidObjectId(userId)) {
        return res.status(400).json({
          status: false,
          message: "Invalid userId",
        });
      }

      if (!fleetAdminUserStatus.includes(status)) {
        return res.status(400).json({
          status: false,
          message: `Allowed status: ${fleetAdminUserStatus.join(" | ")}`,
        });
      }

      const targetUser = await User.findById(userId);

      if (!targetUser) {
        return res.status(404).json({
          status: false,
          message: "User not found",
        });
      }

      if (targetUser.fleetId.toString() !== req.user.fleetId.toString()) {
        return res.status(403).json({
          status: false,
          message: "Unauthorized access",
        });
      }

      const updated = await User.findByIdAndUpdate(
        userId,
        { $set: { status } },
        { returnDocument: "after" },
      ).select("-password");

      return res.status(200).json({
        status: true,
        message: "Status updated successfully",
        data: updated,
      });
    }

    // Fallback
    return res.status(403).json({
      status: false,
      message: "Unauthorized user",
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};

//============= get all user of your company =====
exports.getFleetUser = async (req, res) => {
  try {
    const user = await User.find({
      fleetId: req.user.fleetId,
      role: "USER",
    }).populate("fleetId", "name meta");

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
