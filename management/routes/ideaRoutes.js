const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const Idea = require("../models/Idea");
const Vote = require("../models/Vote");
const User = require("../models/User");
const checkAuthorityRole = require("../middlewares/authorityOnlyMiddleware");

const router = express.Router();

router.post("/submit", authMiddleware, async (req, res) => {
  const { description, title } = req.body;
  const userId = req.user.id;

  try {
    // Create the idea
    const idea = new Idea({
      title,
      description,
      createdBy: userId,
    });

    // Create the associated vote data
    const vote = new Vote({
      entityType: "Idea",
      entityId: idea._id,
      userIds: [], // Add the creator's vote by default
      voteCount: 0, // Start with 1 vote for the creator
    });

    idea.vote = vote._id;

    await idea.save();
    await vote.save();

    res.status(201).json({
      message: "Idea submitted and vote data created",
      ideaId: idea._id,
      voteId: vote._id,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/my-ideas", authMiddleware, async (req, res) => {

  try {
    const userId = req.user.id;

    // Fetch ideas and populate the associated vote
    const ideas = await Idea.find({ createdBy: userId }).populate({
      path: "vote", // The field in the idea model referencing the Vote model
      select: "voteCount", // Fetch only the voteCount field
    });

    console.log(ideas);

    // Format the response
    const formattedIdeas = ideas.map((idea, index) => ({
      _id: idea._id,
      id: index + 1,
      title: idea.title,
      description: idea.description,
      votes: idea.vote?.voteCount || 0, // Default to 0 if no vote is found
      status: idea.status,
    }));

    res.json(formattedIdeas);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch ideas" });
  }
});

router.get("/all-ideas", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch ideas not created by the authenticated user and populate the associated vote
    const ideas = await Idea.find({
      createdBy: { $ne: userId },
    }).populate({
      path: "vote", // The field in the idea model referencing the Vote model
      select: "voteCount userIds", // Fetch voteCount and userIds fields
    });
    

    // Format the response
    const formattedIdeas = ideas.map((idea, index) => ({
      _id: idea._id,
      id: index + 1,
      title: idea.title,
      description: idea.description,
      votes: idea.vote?.voteCount || 0, // Default to 0 if no vote is found
      hasVoted: idea.vote?.userIds.includes(userId) || false, // Check if user has voted
      status: idea.status,
    }));

    res.json(formattedIdeas);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch ideas" });
  }
});

router.get("/authority-ideas", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Ensure the role is Authority
    if (req.user.role !== "Authority") {
      return res
        .status(403)
        .json({ error: "Access denied. Not an Authority." });
    }

    // Define thresholds for weak, medium, and strong ideas
    const WEAK_THRESHOLD = 0.1; // 10% of user count
    const MEDIUM_THRESHOLD = 0.3; // 30% of user count

    // Fetch all ideas with votes > 0
    const ideas = await Idea.find().populate({
      path: "vote",
      select: "voteCount userIds",
    });

    const filteredIdeas = ideas.filter(
      (idea) => idea.vote && idea.vote.voteCount > 0
    );

    // Get the total user count
    const totalUserCount = await User.countDocuments().exec();

    // Format ideas with priority calculation
    const formattedIdeas = filteredIdeas.map((idea, index) => {
      const votes = idea.vote?.voteCount || 0;

      // Calculate the score as a percentage of total user count
      const score = totalUserCount > 0 ? votes / totalUserCount : 0;

      // Determine priority
      let priority = "Weak"; // Default priority
      if (score >= MEDIUM_THRESHOLD) {
        priority = "Strong";
      } else if (score >= WEAK_THRESHOLD) {
        priority = "Medium";
      }

      return {
        _id: idea._id,
        id: index + 1,
        title: idea.title,
        description: idea.description,
        votes,
        hasVoted: idea.vote?.userIds.includes(userId) || false,
        status: idea.status,
        priority, // Add priority field
      };
    });

    res.status(200).json(formattedIdeas);
  } catch (error) {
    console.error("Error fetching authority ideas:", error);
    res.status(500).json({ error: "Failed to fetch authority ideas." });
  }
});

router.put(
  "/update-status",
  authMiddleware,
  checkAuthorityRole,
  async (req, res) => {
    try {
      const { ideaId, status } = req.body;

      if (!ideaId || !status) {
        return res.status(400).json({ error: "Idea ID and status are required." });
      }

      // Find the idea and update its status
      const idea = await Idea.findByIdAndUpdate(
        ideaId,
        { status },
        { new: true } // Return the updated document
      );

      if (!idea) {
        return res.status(404).json({ error: "Idea not found." });
      }

      res.json({ message: "Idea status updated successfully.", idea, status: 200 });
    } catch (error) {
      console.error("Error updating idea status:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  }
);

module.exports = router;
