require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const connectToDb = require("../config/db");

const seedSuperAdmin = async () => {
  await connectToDb();

  const existingSuperAdmin = await User.findOne({ role: "SUPER_ADMIN" });

  if (existingSuperAdmin) {
    console.log("SUPER_ADMIN already exists:", existingSuperAdmin.email);
    process.exit(0);
  }

  let pass = process.env.SUPER_ADMIN_PASSWORD || "Admin@123";
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(pass, saltRounds);

  const superAdmin = new User({
    name: "Super Admin",
    email: process.env.SUPER_ADMIN_EMAIL || "admin@example.com",
    password: hashedPassword,
    role: "SUPER_ADMIN",
    fleetId: null,
  });

  await superAdmin.save();
  console.log("SUPER_ADMIN created:", superAdmin.email, superAdmin);
  process.exit(0);
};

seedSuperAdmin().catch((err) => {
  console.error("Error seeding SUPER_ADMIN:", err);
  process.exit(1);
});
