const mongoose = require("mongoose");
const validator = require("validator");

/**
 * User schema for Mongoose.
 * Defines the structure and validations for user documents.
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxLength: [30, "Name cannot exceed 30 characters"],
      minLength: [4, "Name should have more than 4 characters"],
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
      validate: {
        validator: function (value) {
          return !value.toLowerCase().includes("password");
        },
        message: 'Password cannot contain the word "password"',
      },
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      validate: {
        validator: function (v) {
          return /^\d{10}$/.test(v);
        },
        message: "Phone number must be exactly 10 digits",
      },
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    isMarried: {
      type: Boolean,
      default: false,
    },
    birthday: {
      type: String, // Format: dd/mm/yyyy
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
