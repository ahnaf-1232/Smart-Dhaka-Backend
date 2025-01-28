const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const Complaint = require("../models/Complaint");
const Vote = require("../models/Vote");
const User = require("../models/User");
const checkAuthorityRole = require("../middlewares/authorityOnlyMiddleware");

const router = express.Router();

router.post("/submit", authMiddleware, async (req, res) => {
  const { title, description, lat, lng, address, thana } = req.body;
  const userId = req.user.id;

  try {
    // Create the complaint
    const complaint = new Complaint({
      title,
      description,
      location: { lat, lng, address, thana },
      createdBy: userId,
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
      title: complaint.title,
      description: complaint.description,
      votes: complaint.vote?.voteCount || 0, // Default to 0 if no vote is found
      status: complaint.status,
      lat: complaint.location.lat, // Add latitude directly
      lng: complaint.location.lng, // Add longitude directly
      address: complaint.location.address, // Add address directly
    }));

    console.log(formattedComplaints);

    res.json(formattedComplaints);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch complaints" });
  }
});

router.get("/all-complaints", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const userThana = req.user.thana; // Extract the user's thana
    console.log(userThana);

    // Fetch complaints matching the user's thana and not created by the authenticated user
    const complaints = await Complaint.find({
      createdBy: { $ne: userId },
      "location.thana": userThana, // Filter by thana
    }).populate({
      path: "vote", // The field in the Complaint model referencing the Vote model
      select: "voteCount userIds", // Fetch voteCount and userIds fields
    });

    // Format the response
    const formattedComplaints = complaints.map((complaint, index) => ({
      _id: complaint._id,
      id: index + 1,
      title: complaint.title,
      description: complaint.description,
      votes: complaint.vote?.voteCount || 0, // Default to 0 if no vote is found
      hasVoted: complaint.vote?.userIds.includes(userId) || false, // Check if user has voted
      status: complaint.status,
      lat: complaint.location.lat, // Add latitude directly
      lng: complaint.location.lng, // Add longitude directly
      address: complaint.location.address, // Add address directly
    }));

    console.log(formattedComplaints);

    res.json(formattedComplaints);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch complaints" });
  }
});

router.get("/authority-complaints", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    console.log("Fetching complaints for authority...");
    

    // Ensure the role is Authority
    if (req.user.role !== "Authority") {
      return res
        .status(403)
        .json({ error: "Access denied. Not an Authority." });
    }

    console.log("Fetching complaints for authority...");
    

    // Define thresholds for weak, medium, and strong complaints
    const WEAK_THRESHOLD = 0.1; // 10% of user count
    const MEDIUM_THRESHOLD = 0.3; // 30% of user count

    // Fetch all complaints with votes > 0
    const complaints = await Complaint.find().populate({
      path: "vote",
      select: "voteCount userIds",
    });

    const filteredComplaints = complaints.filter(
      (complaint) => complaint.vote && complaint.vote.voteCount > 0
    );

    console.log(filteredComplaints);
    

    // Count the number of users in each thana
    const userCountsByThana = await User.aggregate([
      { $group: { _id: "$thana", count: { $sum: 1 } } },
    ]).exec();

    // Convert user counts into a lookup object for fast access
    const userCounts = userCountsByThana.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    // Format complaints with priority calculation
    const formattedComplaints = filteredComplaints.map((complaint, index) => {
      const thana = complaint.location.thana;
      const userCount = userCounts[thana] || 0;
      const votes = complaint.vote?.voteCount || 0;

      // Calculate the score as a percentage of user count
      const score = userCount > 0 ? votes / userCount : 0;

      // Determine priority
      let priority = "Weak"; // Default
      if (score >= MEDIUM_THRESHOLD) {
        priority = "Strong";
      } else if (score >= WEAK_THRESHOLD) {
        priority = "Medium";
      }

      return {
        _id: complaint._id,
        id: index + 1,
        title: complaint.title,
        description: complaint.description,
        votes,
        hasVoted: complaint.vote?.userIds.includes(userId) || false,
        status: complaint.status,
        lat: complaint.location.lat,
        lng: complaint.location.lng,
        address: complaint.location.address,
        priority, // Add priority field
      };
    });

    // Sort complaints by priority (Strong > Medium > Weak)
    formattedComplaints.sort((a, b) => {
      const priorityOrder = { Strong: 1, Medium: 2, Weak: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    res.json(formattedComplaints);
  } catch (err) {
    console.error("Error fetching complaints for authority:", err);
    res.status(500).json({ error: "Failed to fetch complaints" });
  }
});

router.put(
  "/update-status",
  authMiddleware,
  checkAuthorityRole,
  async (req, res) => {
    try {
      const { complaintId, status } = req.body;

      if (!complaintId || !status) {
        return res.status(400).json({ error: "Complaint ID and status are required." });
      }

      // Find the complaint and update its status
      const complaint = await Complaint.findByIdAndUpdate(
        complaintId,
        { status },
        { new: true } // Return the updated document
      );

      if (!complaint) {
        return res.status(404).json({ error: "Complaint not found." });
      }

      res.json({ message: "Complaint status updated successfully.", complaint, status: 200 });
    } catch (error) {
      console.error("Error updating complaint status:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  }
);

module.exports = router;
