const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const Idea = require("../models/Idea");
const Vote = require("../models/Vote");

const router = express.Router();

router.post("/submit", authMiddleware, async (req, res) => {
  const { description } = req.body;
  const userId = req.user.id;

  try {
    // Create the complaint
    const idea = new Idea({
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
  
      // Fetch complaints and populate the associated vote
      const ideas = await Idea.find({ createdBy: userId }).populate({
        path: "vote", // The field in the Complaint model referencing the Vote model
        select: "voteCount", // Fetch only the voteCount field
      });
  
      // Format the response
      const formattedIdeas = ideas.map((idea, index) => ({
        _id: idea._id,
        id: index + 1,
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

    // Fetch complaints not created by the authenticated user and populate the associated vote
    const ideas = await Idea.find({
      createdBy: { $ne: userId },
    }).populate({
      path: "vote", // The field in the Complaint model referencing the Vote model
      select: "voteCount userIds", // Fetch voteCount and userIds fields
    });

    // Format the response
    const formattedIdeas = ideas.map((idea, index) => ({
      _id: idea._id,
      id: index + 1,
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

module.exports = router;
