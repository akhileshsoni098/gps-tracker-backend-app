



const FleetDeviceSubscriptionSchema = new mongoose.Schema(
  {
    fleetId: {
      type: mongoose.Schema.Types.ObjectId,
       ref: "User",
      required: true,
      index: true,
    },

    deviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
      required: true,
      index: true,
    },

    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },

    subscriptionType: {
      type: String,
      enum: ["MONTHLY", "YEARLY"],
      default: "MONTHLY",
    },

    price: {
      type: Number,
      required: true,
    },

    // 🔹 Installation Date (Technician install time)

    installedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);
