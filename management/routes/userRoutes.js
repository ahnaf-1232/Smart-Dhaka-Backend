const express = require("express");
const Admin = require("../models/Admin");
const ServiceHolder = require("../models/ServiceHolder");
const GovtAuthority = require("../models/GovtAuthority");
const User = require("../models/User");
const authMiddleware = require("../middlewares/authMiddleware");
const adminOnlyMiddleware = require("../middlewares/adminOnlyMiddleware");

const router = express.Router();

router.get("/admins", authMiddleware, adminOnlyMiddleware, async (req, res) => {
  try {
    const admins = await Admin.find();
    res.status(200).json(admins);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch Admins", details: err.message });
  }
});

router.get(
  "/service-holders",
  authMiddleware,
  adminOnlyMiddleware,
  async (req, res) => {
    try {
      const serviceHolders = await ServiceHolder.find();
      res.status(200).json(serviceHolders);
    } catch (err) {
      res
        .status(500)
        .json({
          error: "Failed to fetch Service Holders",
          details: err.message,
        });
    }
  }
);

router.get(
  "/govt-authorities",
  authMiddleware,
  adminOnlyMiddleware,
  async (req, res) => {
    try {
      const govtAuthorities = await GovtAuthority.find();
      res.status(200).json(govtAuthorities);
    } catch (err) {
      res.status(500).json({
        error: "Failed to fetch Government Authorities",
        details: err.message,
      });
    }
  }
);

router.get(
  "/residents",
  authMiddleware,
  adminOnlyMiddleware,
  async (req, res) => {
    try {
      const residents = await User.find({ role: "Resident" });
      res.status(200).json(residents);
    } catch (err) {
      res.status(500).json({
        error: "Failed to fetch Resident Users",
        details: err.message,
      });
    }
  }
);

module.exports = router;
