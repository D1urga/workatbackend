import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
    otp: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otpExpiry: {
      type: Date,
    },
    accessToken: {
      type: String,
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this.id,
      email: this.email,
      username: this.username,
      fullname: this.fullname,
    },
    "accesstokentoken",
    { expiresIn: "30d" }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this.id,
    },
    "refreshtokentoken",
    { expiresIn: "30d" }
  );
};

export const User = mongoose.model("User", userSchema);
