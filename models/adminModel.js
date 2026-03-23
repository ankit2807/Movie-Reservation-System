const mongoose = require("mongoose");
const validator = require("validator");

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      default: "Admin"
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (value) {
          return validator.isEmail(value);
        },
        message: "Invalid email format",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [7, "Password must be at least 7 characters long"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Admin", adminSchema);
