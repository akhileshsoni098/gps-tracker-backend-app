const { isValidObjectId } = require("mongoose");
const CompanyLedger = require("../../models/companyLedge.model");
const Device = require("../../models/device.model");

// ==================== create Ledger Entries =============

exports.createCompanyLedger = async (req, res) => {
  try {
    const id = req.params.id;

    let { type, expAmount, description, date } = req.body;

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({
        status: false,
        message: "device _id is required for device purchase ledger",
      });
    }

    const validType = ["DEVICE_PURCHASE", "OTHER_EXPENSE"];

    if (!validType.includes(type)) {
      return res.status(400).json({
        status: false,
        message: `type only you can select : ${validType.join(" | ")}`,
      });
    }

    const checkEntry = await CompanyLedger.findOne({ deviceId: id });

    if (checkEntry) {
      return res.status(400).json({
        status: false,
        message: "device ledger already exist",
      });
    }

    const deviceCheck = await Device.findById(id);

    if (!deviceCheck) {
      return res.status(404).json({
        status: false,
        message: "Device Not Found",
      });
    }

    if (!date) {
      date = Date.now();
    }

    if (type === "DEVICE_PURCHASE") {
      const ledger = new CompanyLedger({
        type: type,
        deviceId: id,
        totalAmount: deviceCheck.purchasePrice,
        expAmount: 0,
        description: description,
        date: date,
      });

      await ledger.save();

      return res.status(201).json({
        status: true,
        message: "Ledger entry created successfully",
        data: ledger,
      });
    }

    if (type === "OTHER_EXPENSE") {
      if (!expAmount) {
        return res.status(400).json({
          status: false,
          message: "expAmount is required for other expense",
        });
      }

      let ledgerAmount = Number(expAmount);

      if (isNaN(ledgerAmount)) {
        return res.status(400).json({
          status: false,
          message: "Provide valid expAmount in price",
        });
      }

      if (ledgerAmount < 0) {
        return res.status(400).json({
          status: false,
          message: "Provide more than 0 expAmount in price",
        });
      }

      let totalAmount = ledgerAmount + deviceCheck.purchasePrice;

      const ledger = new CompanyLedger({
        type: type,
        deviceId: id,
        totalAmount: totalAmount,
        expAmount: ledgerAmount,
        description: description,
        date: date,
      });

      await ledger.save();

      return res.status(201).json({
        status: true,
        message: "Ledger entry created successfully",
        data: ledger,
      });
    }
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};
//===================== get All Ledger Entries ===========

exports.getAllLedgerEntries = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      deviceId,
      //   fromDate,
      //   toDate,
      minTotal,
      maxTotal,
      q, // text search in description
      sortBy = "date",
      sortOrder = "desc",
    } = req.query;

    const query = {};

    if (type) query.type = type;
    if (deviceId) query.deviceId = deviceId;

    // if (fromDate || toDate) {
    //   query.date = {};
    //   if (fromDate) query.date.$gte = new Date(fromDate);
    //   if (toDate) query.date.$lte = new Date(toDate);
    // }

    if (minTotal !== undefined || maxTotal !== undefined) {
      query.totalAmount = {};
      if (minTotal !== undefined) query.totalAmount.$gte = Number(minTotal);
      if (maxTotal !== undefined) query.totalAmount.$lte = Number(maxTotal);
    }

    if (q) {
      query.description = { $regex: q, $options: "i" };
    }

    const skip = (Math.max(Number(page), 1) - 1) * Number(limit);

    // choose sort field: allow date | totalAmount | expAmount
    const allowedSort = ["date", "totalAmount", "expAmount"];
    const sortField = allowedSort.includes(sortBy) ? sortBy : "date";
    const sortObj = { [sortField]: sortOrder === "asc" ? 1 : -1 };

    const [total, data] = await Promise.all([
      CompanyLedger.countDocuments(query),
      CompanyLedger.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit))
        .populate(
          "deviceId",
          "deviceId purchasePrice purchaseDate supplier status",
        )

    ]);

    return res.status(200).json({
      status: true,
      message: "Ledger entries retrieved",
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit) || 1),
      },
      data: data,
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

//==================== update Ledger=======================

exports.updateLedgerEntry = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({
        status: false,
        message: "Ledger _id is required for device purchase ledger",
      });
    }

    const allowed = [
      "type",
      "deviceId",
      "expAmount",
      "totalAmount",
      "description",
      "date",
    ];
    const updateData = {};

    for (const key of allowed) {
      if (req.body[key] !== undefined) updateData[key] = req.body[key];
    }

    // validate type
    if (
      updateData.type &&
      !["DEVICE_PURCHASE", "OTHER_EXPENSE"].includes(updateData.type)
    ) {
      return res.status(400).json({ status: false, message: "Invalid type" });
    }

    // validate amounts if provided
    if (updateData.expAmount !== undefined) {
      const e = Number(updateData.expAmount);
      if (isNaN(e) || e < 0) {
        return res.status(400).json({
          status: false,
          message: "expAmount must be a non-negative number",
        });
      }
      updateData.expAmount = e;
    }

    if (updateData.totalAmount !== undefined) {
      const t = Number(updateData.totalAmount);
      if (isNaN(t) || t < 0) {
        return res.status(400).json({
          status: false,
          message: "totalAmount must be a non-negative number",
        });
      }
      updateData.totalAmount = t;
    }

    // if changing deviceId, ensure device exists
    if (updateData.deviceId) {
      const device = await Device.findById(updateData.deviceId);
      if (!device) {
        return res
          .status(404)
          .json({ status: false, message: "Referenced Device not found" });
      }
    }

    // If expAmount changed (or deviceId changed) and totalAmount not explicitly provided, recalc totalAmount
    if (
      updateData.expAmount !== undefined ||
      updateData.deviceId !== undefined
    ) {
      // fetch current ledger to know existing device if deviceId not provided in update
      const existing = await CompanyLedger.findById(id);
      if (!existing) {
        return res
          .status(404)
          .json({ status: false, message: "Ledger entry not found" });
      }

      const targetDeviceId = updateData.deviceId || existing.deviceId;
      if (targetDeviceId) {
        const device = await Device.findById(targetDeviceId);
        const purchasePrice = Number(device?.purchasePrice || 0);
        const newExp =
          updateData.expAmount !== undefined
            ? Number(updateData.expAmount)
            : Number(existing.expAmount || 0);

        // if type is DEVICE_PURCHASE and expAmount exists, keep expAmount but device purchase ledger typically has expAmount 0
        updateData.totalAmount = Number(purchasePrice + newExp);
      }
    }

    if (updateData.date) updateData.date = new Date(updateData.date);

    const updated = await CompanyLedger.findByIdAndUpdate(
      id,
      { $set: updateData },
      {returnDocument : "after" },
    ).populate({
      path: "deviceId",
      select: "deviceId purchasePrice purchaseDate supplier status",
    });

    if (!updated) {
      return res
        .status(404)
        .json({ status: false, message: "Ledger entry not found" });
    }

    return res
      .status(200)
      .json({ status: true, message: "Ledger entry updated", data: updated });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};
