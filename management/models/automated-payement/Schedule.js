const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["Wifi", "Gas", "Current"], required: true }, // Payment type
  amount: { type: Number, required: true },
  recipientAccount: { type: String, required: true }, // bKash account to send the payment
  date: { type: Date, required: true }, // User-specified date
  status: { type: String, enum: ["Pending", "Completed", "Failed"], default: "Pending" },
  reference: { type: String }, // Optional reference for the payment
});

module.exports = mongoose.model("Schedule", scheduleSchema);
