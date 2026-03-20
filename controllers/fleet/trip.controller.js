const Trip = require("../../models/vechileTrip.model");

const User = require("../../models/user.model");



// =========================== Create Trip By Fleet ===========================

exports.tripCreate = async (req, res) => {
  try {
    const fleetId = req.user._id;

    let { startLocation, startTime } = req.body;

    if (!fleetId) {
      return res.status(400).json({
        status: false,
        message: "fleetId is required",
      });
    }

    const fleet = await User.findById(fleetId);

    if (!fleet) {
      return res.status(404).json({
        status: false,
        message: "Fleet not found",
      });
    }

    const startAt = startTime ? new Date(startTime) : new Date();

    const tripDoc = new Trip({
      fleetId,
      startLocation: startLocation || undefined,
      startTime: startAt,
      status: "RUNNING",
    });

    await tripDoc.save();

    // const populated = await Trip.findById(tripDoc._id).populate({
    //   path: "fleetId",
    //   select: "name",
    // });

    return res.status(201).json({
      status: true,
      message: "Trip created successfully",
      data: tripDoc,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};

// =========================== Get All Trips ===========================

exports.getAllTrips = async (req, res) => {
  try {
    const fleetId = req.user._id;
    const {
      page = 1,
      limit = 20,
      status,
      from,
      to,
      sortBy = "startTime",
      sortOrder = "desc",
    } = req.query;

    const query = { fleetId };

    if (status) query.status = status;

    if (from || to) {
      query.startTime = {};
      if (from) query.startTime.$gte = new Date(from);
      if (to) query.startTime.$lte = new Date(to);
    }

    const skip = (Math.max(Number(page), 1) - 1) * Number(limit);

    const sortObj = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [total, trips] = await Promise.all([
      Trip.countDocuments(query),
      Trip.find(query).sort(sortObj).skip(skip).limit(Number(limit)).populate({
        path: "fleetId",
        select: "name",
      }),
    ]);

    return res.status(200).json({
      status: true,
      message: "Trips retrieved",
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
      data: trips,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};

// =========================== Get Trip By ID ===========================

exports.getTripById = async (req, res) => {
  try {
    const id = req.params.id;
    const trip = await Trip.findById(id).populate({
      path: "fleetId",
      select: "name",
    });

    if (!trip) {
      return res.status(404).json({
        status: false,
        message: "Trip not found",
      });
    }

    return res.status(200).json({
      status: true,
      data: trip,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};

// =========================== Update Trip ===========================

exports.updateTrip = async (req, res) => {
  try {
    const id = req.params.id;

    const allowed = [
      "endLocation",
      "endTime",
      "distanceMeters",
      "maxSpeed",
      "avgSpeed",
      "status",
    ];

    const updateData = {};

    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    }

    if (updateData.endTime) {
      updateData.endTime = new Date(updateData.endTime);
    }

    const updated = await Trip.findByIdAndUpdate(
      id,
      { $set: updateData },
      { returnDocument:'after' },
    ).populate({
      path: "fleetId",
      select: "name",
    });

    if (!updated) {
      return res.status(404).json({
        status: false,
        message: "Trip not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Trip updated successfully",
      data: updated,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};


