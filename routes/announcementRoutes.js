const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const Announcement = require("../models/Announcement");

const router = express.Router();

// Add an announcement
router.post("/add", authMiddleware, async (req, res) => {
  const { title, content, priority } = req.body;

  console.log(req.body);

  try {
    const announcement = new Announcement({
      title,
      details: content,
      priority,
    });

    await announcement.save();

    res
      .status(201)
      .json({ message: "Announcement added successfully", announcement });
  } catch (err) {
    res
      .status(400)
      .json({ error: "Failed to add announcement", details: err.message });
  }
});

// Get all announcements
router.get("/all-announcements", async (req, res) => {
    try {
      const announcements = await Announcement.find().sort({ date: -1 });
  
      // Format the createdAt date for each announcement
      const formattedAnnouncements = announcements.map((announcement) => ({
        _id: announcement._id,
        title: announcement.title,
        details: announcement.details,
        priority: announcement.priority,
        createdAt: announcement.createdAt.toISOString().split("T")[0], // Format createdAt
      }));
  
      res.status(200).json(formattedAnnouncements);
    } catch (err) {
      res
        .status(500)
        .json({ error: "Failed to fetch announcements", details: err.message });
    }
  });
  

module.exports = router;
