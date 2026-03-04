const mongoose = require("mongoose");

const VehicleSchema = new mongoose.Schema(
  {
    // Unique Vehicle Identifier (internal)
    vehicleId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // Multi-Tenant Isolation
    fleetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fleet",
      required: true,
      index: true,
    },

    // GPS Device Mapping
    deviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
      default: null,
      index: true,
    },

    // Vehicle Details
    registrationNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },

    vehicleType: {
      type: String,
      enum: ["TRUCK", "CAR", "BUS", "BIKE", "VAN", "OTHER"],
      default: "OTHER",
    },

    model: {
      type: String,
      trim: true,
    },

    manufacturer: {
      type: String,
      trim: true,
    },

    // Live Status
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "OFFLINE", "BLOCKED"],
      default: "ACTIVE",
      index: true,
    },

    ignitionOn: {
      type: Boolean,
      default: false,
    },

    isMoving: {
      type: Boolean,
      default: false,
    },

    // Real-Time Location (GeoJSON)
    lastLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        index: "2dsphere",
      },
    },

    lastSpeed: {
      type: Number,
      default: 0,
    },

    lastHeading: {
      type: Number,
      default: 0,
    },

    lastAltitude: {
      type: Number,
      default: 0,
    },

    lastSeenAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    // Trip Tracking
    currentTripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      default: null,
    },

    totalDistanceMeters: {
      type: Number,
      default: 0,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const Vehicle = mongoose.model("Vehicle", VehicleSchema);

module.exports = Vehicle;

/* 

VehicleSchema.index({ fleetId: 1 });
VehicleSchema.index({ registrationNumber: 1 });
VehicleSchema.index({ deviceId: 1 });
VehicleSchema.index({ lastLocation: "2dsphere" });
VehicleSchema.index({ status: 1 });
VehicleSchema.index({ isDeleted: 1 });

*/
