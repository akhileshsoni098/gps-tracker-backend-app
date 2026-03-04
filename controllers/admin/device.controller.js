const Device = require("../../models/device.model");

// ============== device purchased Entry =====

exports.devicePurchaseEntry = async (req, res) => {
  try {
    const { deviceId, purchasePrice, purchaseDate } = req.body;

    if (!deviceId || deviceId.trim() == "" || typeof deviceId !== "string") {
      return res.status(400).json({
        status: false,
        message: "Kindly provide non empty valid deviceId",
      });
    }

    const checkDevice = await Device.findOne({ deviceId: deviceId });

    if (checkDevice) {
      return res
        .status(400)
        .json({ status: false, message: "This Device has already purchased" });
    }

    if (!purchasePrice) {
      return res.status(400).json({
        status: false,
        message: "Kindly provide purchse price of the device",
      });
    }

    let validPurchasePrice = Number(purchasePrice);

    if (isNaN(validPurchasePrice)) {
      return res.status(400).json({
        status: false,
        message: "kindly provide valid purchase price",
      });
    }

    if (!purchaseDate) {
      purchaseDate = Date.now();
    }

    const newDevice = new Device({
      deviceId: deviceId,
      purchasePrice: purchasePrice,
      purchaseDate: purchaseDate,
    });

    await newDevice.save();

    if (!newDevice) {
      return res
        .status(400)
        .json({ status: false, message: "Something wents wrong" });
    }

    return res.status(201).json({
      status: true,
      message: "Device Entry done successfully",
      data: newDevice,
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

// =============== Get all device purchase entry =====

exports.getAllPurchasedDevices = async (req, res) => {
  try {
    const query = req.query;

    const allDevices = await Device.find({ ...query }).populate(
      "assignedFleetId",
    );
    // .populate("assignedVehicleId");

    return res.status(200).json({
      status: false,
      message: "All Purchased devices retrived successfully",
      data: allDevices,
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

//================== update device Purchase =============

exports.deviceUpdateEntry = async (req, res) => {
  try {
    const id = req.params.id;

    const {
      deviceId,
      purchasePrice,
      purchaseDate,
      supplier,
      status,
      assignedFleetId,
      assignedVehicleId,
    } = req.body;

    let updateData = {};

    if (deviceId) {
      if (deviceId.trim() === "" || typeof deviceId !== "string") {
        return res.status(400).json({
          status: false,
          message: "Kindly provide non empty valid deviceId",
        });
      }

      const checkDevice = await Device.findOne({
        deviceId: deviceId,
        _id: { $ne: id },
      });

      if (checkDevice) {
        return res.status(400).json({
          status: false,
          message: "This device already in purchase Entry",
        });
      }

      updateData.deviceId = deviceId;
    }

    if (purchasePrice) updateData.purchasePrice = Number(purchasePrice);

    if (purchaseDate) updateData.purchaseDate = purchaseDate;

    if (supplier) updateData.supplier = supplier;

    if (status) updateData.status = status;

    if (assignedFleetId) updateData.assignedFleetId = assignedFleetId;

    if (assignedVehicleId) updateData.assignedVehicleId = assignedVehicleId;

    const updatedDevice = await Device.findOneAndUpdate(
      { _id: id },
      { $set: updateData },
      { returnDocument: "after" },
    );

    if (!updatedDevice) {
      return res.status(404).json({
        status: false,
        message: "Device not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Device updated successfully",
      data: updatedDevice,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};
