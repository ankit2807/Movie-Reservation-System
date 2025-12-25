const mongoose = require("mongoose");
const validator = require("validator");

/**
 * Admin schema for Mongoose.
 * Defines the structure and validations for admin documents.
 */
const adminSchema = new mongoose.Schema(
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
    isAdmin: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add index for email uniqueness
adminSchema.index({ email: 1 });

module.exports = mongoose.model("Admin", adminSchema);
