const mongoose = require("mongoose");

const DeviceSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      unique: true,
    },

    status: {
      type: String,
      enum: ["AVAILABLE", "ASSIGNED", "INACTIVE"],
      default: "AVAILABLE",
    },

    purchasePrice: {
      type: Number,
      required:true
    },
    purchaseDate: {
      type: Date,
      default:Date.now()
    },
    supplier: {
      type: String,
    },

    assignedFleetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fleet",
      default: null,
    },

    assignedVehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      default: null,
    },
  },
  { timestamps: true },
);

const Device = mongoose.model("Device", DeviceSchema);

module.exports = Device;
