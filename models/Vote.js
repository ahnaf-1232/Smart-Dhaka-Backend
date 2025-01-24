const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema(
  {
    entityType: {
      type: String,
      enum: ["Complaint", "Idea"],
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "entityType",
    },
    userIds: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    voteCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vote", voteSchema);
