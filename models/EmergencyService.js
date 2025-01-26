const mongoose = require("mongoose");

const emergencyServiceSchema = new mongoose.Schema(
  {
    serviceHolderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceHolder", // Assuming Service Holder is a type of User
      required: true,
    },
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assuming the requester is a User
      required: true,
    },
    requesterLocation: {
      lat: {
        type: Number,
        required: true,
      },
      lng: {
        type: Number,
        required: true,
      },
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved", "Closed"],
      default: "Pending",
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

module.exports = mongoose.model("EmergencyService", emergencyServiceSchema);