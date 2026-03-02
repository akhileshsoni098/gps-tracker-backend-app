const mongoose = require("mongoose");

// Fleet means Company or orginization jiska under vihicle h

const FleetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    meta: {
      type: Object,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

const Fleet = mongoose.model("Fleet", FleetSchema);

module.exports = Fleet;
