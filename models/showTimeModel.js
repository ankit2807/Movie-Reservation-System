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
      validate: {
        validator: function (v) {
          return /^\d{1,2}:\d{2}$/.test(v); // HH:MM format
        },
        message: "Start time must be in HH:MM format",
      },
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
