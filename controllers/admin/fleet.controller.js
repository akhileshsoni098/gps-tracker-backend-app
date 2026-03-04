const { isValidObjectId } = require("mongoose");
const Fleet = require("../../models/fleet.model");

//================ create fleet by super admin ==========

exports.createFleet = async (req, res) => {
  try {
    const data = req.body;
    let { name, meta } = data;

    if (!name || name.trim() === "" || typeof name !== "string") {
      return res
        .status(400)
        .json({ status: false, message: "name should be non empty string " });
    }

    const checkFleet = await Fleet.findOne({ name: name });
    if (checkFleet) {
      return res
        .status(400)
        .json({ status: false, message: `${name} company already exist` });
    }

    const fleet = new Fleet({
      name,
      meta,
    });

    await fleet.save();

    return res.status(201).json({
      status: true,
      message: "Fleet created successfully",
      data: fleet,
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

//============== upadate fleet super admin only============
exports.updateFleet = async (req, res) => {
  try {
    const fleetId = req.params.id;

    if (!fleetId || !isValidObjectId(fleetId)) {
      return res.status(400).json({
        status: false,
        message: "Invalid fleet ID",
      });
    }

    const { name, meta } = req.body;
    const updateData = {};

    // Validate name if provided
    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          status: false,
          message: "Name must be a non-empty string",
        });
      }

      // Check duplicate (excluding current fleet)
      const existingFleet = await Fleet.findOne({
        name: name.trim(),
        _id: { $ne: fleetId },
      });

      if (existingFleet) {
        return res.status(400).json({
          status: false,
          message: `${name} company already exists`,
        });
      }

      updateData.name = name.trim();
    }

    if (meta !== undefined) {
      updateData.meta = meta;
    }

    const updatedFleet = await Fleet.findByIdAndUpdate(
      fleetId,
      { ...updateData },
      {
        returnDocument: "after",
      },
    );

    if (!updatedFleet) {
      return res.status(404).json({
        status: false,
        message: "Fleet not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Fleet updated successfully",
      data: updatedFleet,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};
//========== get all fleet for super admin =============

exports.getAllFleet = async (req, res) => {
  try {
    const { page = 1, limit = 10, name, status } = req.query;

    const parsedPage = Math.max(parseInt(page), 1);
    const parsedLimit = Math.min(Math.max(parseInt(limit), 1), 100);

    const skip = (parsedPage - 1) * parsedLimit;

    // Build safe filter object
    const filter = {};

    if (name) {
      filter.name = { $regex: name.trim(), $options: "i" };
    }

    const [fleets, total] = await Promise.all([
      Fleet.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit)
        .lean(),
      Fleet.countDocuments(filter),
    ]);

    return res.status(200).json({
      status: true,
      message: "Fleet fetched successfully",
      data: fleets,
      pagination: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit),
      },
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};

//========== get fleet by id for super admin ===========

exports.getFleetById = async (req, res) => {
  try {
    const fleetId = req.params.id;
    if (!fleetId || !isValidObjectId(fleetId)) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid fleet ID" });
    }
    const fleet = await Fleet.findById(fleetId);
    if (!fleet) {
      return res
        .status(404)
        .json({ status: false, message: "Fleet not found" });
    }
    return res.status(200).json({
      status: true,
      message: "Fleet fetched successfully",
      data: fleet,
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};
