const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const Vote = require("../models/Vote");

const router = express.Router();

router.post("/vote", authMiddleware, async (req, res) => {
  const { entityType, entityId } = req.body;
  const userId = req.user.id;

  console.log(entityType, entityId, userId);

  if (!["Complaint", "Idea"].includes(entityType)) {
    return res.status(400).json({ message: "Invalid entity type" });
  }

  try {
    // Find or create a vote entry
    let vote = await Vote.findOne({ entityType, entityId });

    if (!vote) {
      vote = new Vote({ entityType, entityId, userIds: [userId], voteCount: 1 });
    } else {
      // Check if the user has already voted
      if (vote.userIds.includes(userId)) {
        return res
          .status(400)
          .json({ message: "User has already voted for this entity" });
      }

      // Add the user ID and increment the vote count
      vote.userIds.push(userId);
      vote.voteCount += 1;
    }

    await vote.save();

    res.status(200).json({
      message: "Vote registered successfully",
      voteCount: vote.voteCount,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to register vote" });
  }
});

router.delete("/vote", authMiddleware, async (req, res) => {
    const { entityType, entityId } = req.body;
    const userId = req.user.id;
  
    if (!["Complaint", "Idea"].includes(entityType)) {
      return res.status(400).json({ message: "Invalid entity type" });
    }
  
    try {
      const vote = await Vote.findOne({ entityType, entityId });
  
      if (!vote) {
        return res.status(404).json({ message: "Vote entry not found" });
      }
  
      // Check if the user has voted
      if (!vote.userIds.includes(userId)) {
        return res
          .status(400)
          .json({ message: "User has not voted for this entity" });
      }
  
      // Remove the user ID and decrement the vote count
      vote.userIds = vote.userIds.filter((id) => id.toString() !== userId);
      vote.voteCount -= 1;
  
      await vote.save();
  
      res.status(200).json({
        message: "Vote removed successfully",
        voteCount: vote.voteCount,
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to remove vote" });
    }
  });

  module.exports = router;
  
