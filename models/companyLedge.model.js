const mongoose = require("mongoose");

const CompanyLedgerSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["DEVICE_PURCHASE", "OTHER_EXPENSE"],
      required: true,
      index: true,
    },

    deviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
      default: null,
      index: true,
    },

    expAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true },
);

const CompanyLedger = mongoose.model("CompanyLedger", CompanyLedgerSchema);

module.exports = CompanyLedger;
