const mongoose = require("mongoose");

const TripSchema = new mongoose.Schema(
  {
    fleetId: {
      type: mongoose.Schema.Types.ObjectId,
       ref: "User",
      required: true,
      index: true,
    },

    startLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: [Number],
    },

    endLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: [Number],
    },

    startTime: {
      type: Date,
      required: true,
    },

    endTime: {
      type: Date,
    },

    distanceMeters: {
      type: Number,
      default: 0,
    },

    maxSpeed: {
      type: Number,
      default: 0,
    },

    avgSpeed: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["RUNNING", "COMPLETED"],
      default: "RUNNING",
      index: true,
    },
  },
  { timestamps: true }
);

const Trip = mongoose.model("Trip", TripSchema);

module.exports = Trip