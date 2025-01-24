const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, required: true },
    phone: String,
    nid: String,
    presentAddress: String,
    permanentAddress: String,
    lat: Number,
    lng: Number,
    password: String,
    role: {
      type: String,
      enum: ["Resident", "ServiceHolder", "Authority", "Admin"],
      required: true,
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model("User", UserSchema);
