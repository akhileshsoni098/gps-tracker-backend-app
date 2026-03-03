const mongoose = require("mongoose");

const userSchmema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["USER", "FLEET_ADMIN", "SUPER_ADMIN"],
      default: "USER",
    },

    fleetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fleet",
    },

    status: {
      type: String,
      enum: ["ACTIVE","INACTIVE", "BLOCKED", "DELETED"],
      default: "ACTIVE",
    },

    lastLoginAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchmema);

module.exports = User;