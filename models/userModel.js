const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter your name!"],
    minLength: [3, "Name must have more than 3 characters"],
  },

  email: {
    type: String,
    required: [true, "Please Enter your email!"],
    unique: true,
    validate: [
      validator.isEmail,
      "Invalid Email type.Please Enter a valid Email",
    ],
  },

  password: {
    type: String,
    required: [true, "Please Enter your password!"],
    minLength: [6, "Password must be greater than 6 characters"],
    select: false, //False, so that when find called , Password doesn't get fetched.
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  avatar: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  role: {
    type: String,
    default: "user",
  },

  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

userSchema.pre("save", async function (next) {
  //So that when user chnage data but not password, there is no need to hash password bcz it is
  //already hashed. 
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

//JWT Token
userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

//Making Reset Password(Forgot Password)
userSchema.methods.getResetPasswordToken = async function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  //Hashing and adding to User SCHEMA
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000; //15 minutes
  return resetToken;
};

module.exports = mongoose.model("User", userSchema);
