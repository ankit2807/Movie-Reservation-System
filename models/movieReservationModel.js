const mongoose = require("mongoose");

/**
 * Reservation schema for Mongoose.
 * Defines the structure and validations for movie reservation documents.
 */
const reservationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: [true, "Movie is required"],
    },
    showtime: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShowTime",
      required: [true, "Showtime is required"],
    },
    seats: [
      {
        type: String,
        required: true,
        validate: {
          validator: function (v) {
            return /^[A-Z]\d+$/.test(v); // e.g., A1, B10
          },
          message: "Seat must be in format like A1 or B10",
        },
      },
    ],
    date: {
      type: Date,
      required: [true, "Reservation date is required"],
    },
  },
  { timestamps: true }
);

// Ensure seats array is not empty
reservationSchema.pre("save", function (next) {
  if (this.seats.length === 0) {
    return next(new Error("At least one seat must be selected"));
  }
  next();
});

// Add index for user and showtime for efficient queries
reservationSchema.index({ user: 1, showtime: 1 });
reservationSchema.index({ showtime: 1, date: 1 });

module.exports = mongoose.model("Reservation", reservationSchema);
