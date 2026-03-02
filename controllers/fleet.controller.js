const { isValidObjectId } = require("mongoose");
const Fleet = require("../models/Fleet");

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
      return res
        .status(400)
        .json({ status: false, message: "Invalid fleet ID" });
    }

    const data = req.body;
    let { name, meta, status, isDeleted } = data;

    if (name) {
      if (name.trim() === "" || typeof name !== "string") {
        return res
          .status(400)
          .json({ status: false, message: "name should be non empty string " });
      }
      // $ne current document ignore case sensitive

      const checkFleet = await Fleet.findOne({
        name: name,
        _id: { $ne: fleetId },
      });
      if (checkFleet) {
        return res
          .status(400)
          .json({ status: false, message: `${name} company already exist` });
      }
    }

    isDeleted = isDeleted === true || isDeleted === "true" ? true : false;

    if (isDeleted === true) {
      status = "INACTIVE";
    }

    const validStatus = ["ACTIVE", "INACTIVE"];

    if (!validStatus.includes(status)) {
      return res
        .status(400)
        .json({
          status: false,
          message: `invalid status: STATUS will be one of these ${validStatus.join(" ")} `,
        });
    }

    const updateFleet = await Fleet.findByIdAndUpdate(
      fleetId,
      {
        name,
        meta,
        status,
        isDeleted,
        deletedAt: isDeleted ? new Date() : null,
      },
      { returnDocument: "after" },
    );
    if (!updateFleet) {
      return res
        .status(404)
        .json({ status: false, message: "Fleet not found" });
    }
    return res.status(201).json({
      status: true,
      message: "Fleet updated successfully",
      data: updateFleet,
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

//========== get all fleet for super admin =============

exports.getAllFleet = async (req, res) => {
  try {
    // pagination + query

    let query = req.query;

    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    if (query.name) {
      query.name = { $regex: query.name, $options: "i" }; // case sensitive
    }
    if (query.isDeleted !== undefined) {
      query.isDeleted = query.isDeleted === "true" ? true : false;
    }
    if (query.status) {
      query.status =
        query.status.toUpperCase() === "ACTIVE" ? "ACTIVE" : "INACTIVE";
    }

    const count = await Fleet.countDocuments({ ...query });

    const fleet = await Fleet.find({ ...query })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      status: true,
      message: "Fleet fetched successfully",
      data: fleet,
      count: count,
      page: page,
      limit: limit,
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
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
