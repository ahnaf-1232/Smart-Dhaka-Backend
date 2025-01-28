const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const GovtAuthority = require("../models/GovtAuthority");
const ServiceHolder = require("../models/ServiceHolder");
const Admin = require("../models/Admin");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/register", async (req, res) => {
  console.log("Registering...");
  const {
    name,
    email,
    password,
    nid,
    thana,
    houseNo,
    role,
  } = req.body;

  try {
    // Validate role
    const forbiddenRoles = ["ServiceHolder", "Authority", "Admin"];
    if (forbiddenRoles.includes(role)) {
      return res.status(403).json({
        error: `Users with the role "${role}" cannot be registered.`,
      });
    }

    // Create a new user
    const user = new User({
      name,
      email,
      password,
      nid,
      thana,
      houseNo,
      role,
    });

    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/create-admin", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Validate input
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email, and password are required." });
    }

    // Check if email already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ error: "Email already exists." });
    }

    // Create a new admin
    const admin = new Admin({
      name,
      email,
      password,
    });

    await admin.save();
    res
      .status(201)
      .json({ message: "Admin account created successfully", admin });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to create admin account", details: err.message });
  }
});

router.post("/create-service-holder", async (req, res) => {
  const { name, email, password, phone, serviceType, thana, lat, lng } = req.body;

  try {
    // Validate input
    if (!name || !email || !password || !serviceType) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Check if email or phone already exists
    const existingUser = await ServiceHolder.findOne({
      $or: [{ email }, { phone }],
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Email or phone number already exists." });
    }

    console.log("Creating Service Holder...", req.body);
    

    // Create the Service Holder
    const serviceHolder = new ServiceHolder({
      name,
      email,
      password,
      serviceType,
      location: { lat, lng, thana },
    });

    console.log(serviceHolder);
    

    await serviceHolder.save();
    res
      .status(201)
      .json({ message: "Service Holder created successfully", serviceHolder });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to create Service Holder", details: err.message });
  }
});

router.post("/create-govt-authority", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Check if email already exists
    const existingUser = await GovtAuthority.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists." });
    }

    // Create the Government Authority
    const govtAuthority = new GovtAuthority({
      name,
      email,
      password,
    });

    await govtAuthority.save();
    res.status(201).json({
      message: "Government Authority created successfully",
      govtAuthority,
    });
  } catch (err) {
    res.status(500).json({
      error: "Failed to create Government Authority",
      details: err.message,
    });
  }
});

router.post("/login", async (req, res) => {
  console.log("Login...");
  
  const { email, password, userType } = req.body;
  let user;
  if (userType === "Service Holder") {
    user = await ServiceHolder.findOne({ email });
  } else if (userType === "Authority") {
    user = await GovtAuthority.findOne({ email });
  } 
  else if (userType === "Admin") {
    user = await Admin.findOne({ email });
  }
  else {
    user = await User.findOne({ email });
  }

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const token = jwt.sign(
    { id: user._id, role: user.role, name: user.name, email: user.email, thana: user.thana },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
  res.json({
    token: token,
    role: user.role,
    id: user._id,
    email: user.email,
    name: user.name,
  });
});

router.get("/validate-token", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ role: user.role });
  } catch (err) {
    res.status(500).json({ error: "Token validation failed", details: err.message });
  }
});

module.exports = router;
