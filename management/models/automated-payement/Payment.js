const paymentLogSchema = new mongoose.Schema({
    scheduleId: { type: mongoose.Schema.Types.ObjectId, ref: "Schedule", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["Wifi", "Gas", "Current"], required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["Success", "Failed"], required: true },
    message: { type: String },
    date: { type: Date, default: Date.now },
  });
  
  module.exports = mongoose.model("PaymentLog", paymentLogSchema);
  