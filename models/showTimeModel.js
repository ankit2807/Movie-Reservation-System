const mongoose = require("mongoose");

/**
 * ShowTime schema for Mongoose.
 * Defines the structure and validations for showtime documents.
 */
const showTimeSchema = new mongoose.Schema(
  {
    startAt: {
      type: String,
      required: [true, "Start time is required"],
      trim: true,
    },
    format: {
      type: String,
      default: "2D",
    },
    price: {
      type: Number,
      default: 250,
    },
    theatre: {
      type: String,
      default: "PVR: Logix City Centre Mall, Noida",
    },
    screen: {
      type: String,
      default: "AUDI 01",
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
      validate: {
        validator: function (value) {
          return value > this.startDate;
        },
        message: "End date must be after start date",
      },
    },
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: [true, "Movie ID is required"],
    },
  },
  { timestamps: true }
);

// Add index for movieId and startDate for efficient queries
showTimeSchema.index({ movieId: 1, startDate: 1 });

module.exports = mongoose.model("ShowTime", showTimeSchema);
