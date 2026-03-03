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
  },
  { timestamps: true },
);

const Fleet = mongoose.model("Fleet", FleetSchema);

module.exports = Fleet;
