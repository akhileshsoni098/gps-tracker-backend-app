const { isValidObjectId } = require("mongoose");
const Device = require("../../models/device.model");
const Vehicle = require("../../models/vehicle.model");
const User = require("../../models/user.model");

//    create vehicle by fleet admin

exports.vehicleCreate = async (req, res) => {
  try {
    const id = req.user._id;

    const { vehicleId, registrationNumber, vehicleType, model, manufacturer } =
      req.body;

    if (!id || !isValidObjectId(id)) {
      return res
        .status(400)
        .json({ status: false, message: "provide valid device_Id" });
    }

    if (!vehicleId || typeof vehicleId !== "string" || vehicleId.trim() == "") {
      return res.status(400).json({
        status: false,
        message: "vehicle unique id is requied non empty valid vehicle id",
      });
    }

    const checkVehicle = await Vehicle.findOne({ vehicleId: vehicleId });

    if (checkVehicle) {
      return res
        .status(400)
        .json({ status: false, message: "VehicleId is already present" });
    }

    if (
      !registrationNumber ||
      typeof registrationNumber !== "string" ||
      registrationNumber.trim() == ""
    ) {
      return res.status(400).json({
        status: false,
        message:
          "registration number is required non empty valid registration number",
      });
    }

    const valdVehicleType = ["TRUCK", "CAR", "BUS", "BIKE", "VAN", "OTHER"];

    if (vehicleType && !valdVehicleType.includes(vehicleType)) {
      return res.status(400).json({
        status: false,
        message:
          "vehicle type should be one of these TRUCK, CAR, BUS, BIKE, VAN, OTHER",
      });
    }

    if (model && typeof model !== "string") {
      return res
        .status(400)
        .json({ status: false, message: "model should be a valid string" });
    }

    if (manufacturer && typeof manufacturer !== "string") {
      return res.status(400).json({
        status: false,
        message: "manufacturer should be a valid string",
      });
    }
    const vehicle = await Vehicle.create({
      vehicleId,
      registrationNumber,
      vehicleType,
      model,
      manufacturer,
      fleetId: req.user._id,
    });

    return res.status(201).json({
      status: true,
      message: "Vehicle created successfully",
      data: vehicle,
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

//   update vehicle by fleet admin

exports.vehicleUpdate = async (req, res) => {
  try {
    const id = req.params.id;

    const { registrationNumber, vehicleType, model, manufacturer, status } =
      req.body;

    if (!id || !isValidObjectId(req.user._id)) {
      return res
        .status(400)
        .json({ status: false, message: "provide valid vehicle_Id" });
    }

    if (
      registrationNumber &&
      (typeof registrationNumber !== "string" ||
        registrationNumber.trim() == "")
    ) {
      return res.status(400).json({
        status: false,
        message:
          "registration number is required non empty valid registration number",
      });
    }

    const valdVehicleType = ["TRUCK", "CAR", "BUS", "BIKE", "VAN", "OTHER"];

    if (vehicleType && !valdVehicleType.includes(vehicleType)) {
      return res.status(400).json({
        status: false,
        message:
          "vehicle type should be one of these TRUCK, CAR, BUS, BIKE, VAN, OTHER",
      });
    }

    if (
      status &&
      !["ACTIVE", "INACTIVE", "BLOCKED", "DELETED"].includes(status)
    ) {
      return res.status(400).json({
        status: false,
        message:
          "status should be one of these ACTIVE, INACTIVE, BLOCKED, DELETED",
      });
    }

    if (model && typeof model !== "string") {
      return res
        .status(400)
        .json({ status: false, message: "model should be a valid string" });
    }

    if (manufacturer && typeof manufacturer !== "string") {
      return res.status(400).json({
        status: false,
        message: "manufacturer should be a valid string",
      });
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      id,
      { $set: { registrationNumber, vehicleType, model, manufacturer,status } },
      { returnDocument: "after" },
    );

    return res.status(200).json({
      status: true,
      message: "Vehicle updated successfully",
      data: updatedVehicle,
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

// get all vehicles of fleet by fleet admin

exports.getFleetVehicles = async (req, res) => {
  try {
    const id = req.user._id;

    if (!id || !isValidObjectId(id)) {
      return res
        .status(400)
        .json({ status: false, message: "provide valid fleet_Id" });
    }

    const vehicles = await Vehicle.find({ fleetId: id })
      .populate("fleetId", "name email role status")
      .populate("deviceId", "deviceId status lastLocation")
    //   .populate("tripId", "");

    return res.status(200).json({
      status: true,
      message: "Vehicles fetched successfully",
      data: vehicles,
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};
