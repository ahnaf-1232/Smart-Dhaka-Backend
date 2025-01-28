const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const Schedule = require("../models/schedule");

const router = express.Router();

router.post("/add-schedule", authMiddleware, async (req, res) => {
  const { type, amount, recipientAccount, date, reference } = req.body;

  try {
    const newSchedule = await Schedule.create({
      userId: req.user.id,
      type,
      amount,
      recipientAccount,
      date,
      reference,
    });

    res.status(201).json({ message: "Schedule created successfully", newSchedule });
  } catch (error) {
    res.status(500).json({ error: "Failed to create schedule", details: error.message });
  }
});

module.exports = router;
