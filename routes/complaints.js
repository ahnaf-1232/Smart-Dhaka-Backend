const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const Complaint = require("../models/complaint");
const Vote = require("../models/Vote");

const router = express.Router();

router.post("/submit", authMiddleware, async (req, res) => {
  const { description, lat, lng, address } = req.body;
  const userId = req.user.id;

  try {
    // Create the complaint
    const complaint = new Complaint({
      description,
      location: { lat, lng, address },
      createdBy: userId,
      location: { lat, lng, address },
    });

    // Create the associated vote data
    const vote = new Vote({
      entityType: "Complaint",
      entityId: complaint._id,
      userIds: [], // Add the creator's vote by default
      voteCount: 0, // Start with 1 vote for the creator
    });

    complaint.vote = vote._id;

    await complaint.save();
    await vote.save();

    res.status(201).json({
      message: "Complaint submitted and vote data created",
      complaintId: complaint._id,
      voteId: vote._id,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/my-complaints", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch complaints and populate the associated vote
    const complaints = await Complaint.find({ createdBy: userId }).populate({
      path: "vote", // The field in the Complaint model referencing the Vote model
      select: "voteCount", // Fetch only the voteCount field
    });

    // Format the response
    const formattedComplaints = complaints.map((complaint, index) => ({
      _id: complaint._id,
      id: index + 1,
      description: complaint.description,
      votes: complaint.vote?.voteCount || 0, // Default to 0 if no vote is found
      status: complaint.status,
    }));

    res.json(formattedComplaints);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch complaints" });
  }
});


router.get("/all-complaints", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch complaints not created by the authenticated user and populate the associated vote
    const complaints = await Complaint.find({
      createdBy: { $ne: userId },
    }).populate({
      path: "vote", // The field in the Complaint model referencing the Vote model
      select: "voteCount userIds", // Fetch voteCount and userIds fields
    });

    // Format the response
    const formattedComplaints = complaints.map((complaint, index) => ({
      _id: complaint._id,
      id: index + 1,
      description: complaint.description,
      votes: complaint.vote?.voteCount || 0, // Default to 0 if no vote is found
      hasVoted: complaint.vote?.userIds.includes(userId) || false, // Check if user has voted
      status: complaint.status,
    }));

    res.json(formattedComplaints);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch complaints" });
  }
});

module.exports = router;
