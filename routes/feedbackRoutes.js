const express = require("express");
const Feedback = require("../models/Feedback");
const authMiddleware = require("../middlewares/authMiddleware"); // For authentication

const router = express.Router();

router.post("/create", authMiddleware, async (req, res) => {
  const { title, content, rating } = req.body;

  console.log("Creating feedback...");
  

  try {
    // Validate input
    if (!title || !content || !rating) {
      return res
        .status(400)
        .json({ error: "Title, content, and rating are required." });
    }

    // Create feedback
    const feedback = new Feedback({
      title,
      content,
      rating,
      feedbackGiverId: req.user.id, // User ID from the authMiddleware
    });

    await feedback.save();
    res
      .status(201)
      .json({ message: "Feedback created successfully", feedback });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to create feedback", details: err.message });
  }
});

router.get("/all", async (req, res) => {
  try {
    const feedbacks = await Feedback.find().populate(
      "feedbackGiverId",
      "name email"
    );
    res.status(200).json(feedbacks);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch feedbacks", details: err.message });
  }
});

router.get("/my-feedbacks", authMiddleware, async (req, res) => {
  try {
    const myFeedbacks = await Feedback.find({ feedbackGiverId: req.user.id });
    res.status(200).json(myFeedbacks);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch your feedbacks", details: err.message });
  }
});

module.exports = router;
