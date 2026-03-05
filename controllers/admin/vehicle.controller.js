const { isValidObjectId } = require("mongoose");
const Device = require("../../models/device.model");
const Vehicle = require("../../models/vehicle.model");
const User = require("../../models/user.model");


// {{super admin flow  fleet select => select abailable device =>assign to vehicle that's it monthly yearly subscription  then fleet will subscript payment }}   before this i have to allow fleet to create trip accordingly 

// then after socket will come into picture 

