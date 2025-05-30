const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // googleId: { type: String, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    username: { type: String, required: true },
    password: {
      type: String,
      required: true,
    },
    profilePicture: String,
  },
  { timestamps: true }
);

userSchema.index({ email: 1 });
const User = mongoose.model("User", userSchema);
module.exports = User;
