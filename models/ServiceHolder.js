const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const serviceHolderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    serviceType: {
      type: String,
      enum: ["Hospital", "Police", "Fire Service"],
      required: true,
      trim: true,
    },
    role: {
      type: String,
      default: "ServiceHolder",
      required: true,
    },
    location: {
      lat: Number,
      lng: Number,
      thana: String
    }
  },
  { timestamps: true }
);

serviceHolderSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model("ServiceHolder", serviceHolderSchema);
