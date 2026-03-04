const { isValidObjectId } = require("mongoose");
const User = require("../../models/user.model");


exports.updateStatusUser = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || typeof status !== "string") {
      return res.status(400).json({
        status: false,
        message: "Please provide a valid status",
      });
    }

    // Allowed statuses
    const SelfStatus = ["ACTIVE", "INACTIVE"];

    // ===============================
    // 🔹 USER updating self
    // ===============================

    if (!SelfStatus.includes(status)) {
      return res.status(400).json({
        status: false,
        message: `Allowed status: ${SelfStatus.join(" | ")}`,
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
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};
