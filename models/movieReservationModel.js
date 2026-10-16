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
    // Optional refs: TMDB-sourced movies and generated cinema shows have no Mongo documents
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
    },
    showtime: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShowTime",
    },
    // Unique key of a show: movieId__theatreId__YYYY-MM-DD__HH:MM (used for seat conflicts)
    showKey: {
      type: String,
      trim: true,
      index: true,
    },
    bookingId: {
      type: String,
      index: true,
    },
    status: {
      type: String,
      enum: ["CONFIRMED", "CANCELLED"],
      default: "CONFIRMED",
    },
    cancelledAt: Date,
    refundAmount: Number,
    // Snapshot of the booked show (so bookings render even for external movies)
    movieRef: String,
    movieTitle: String,
    posterImage: String,
    certification: String,
    language: String,
    format: String,
    theatre: {
      id: String,
      name: String,
      address: String,
      screen: String,
    },
    showDate: String, // YYYY-MM-DD
    showTime: String, // HH:MM (24h)
    showDateTime: Date,
    seatDetails: [
      {
        _id: false,
        seat: String,
        tier: String,
        price: Number,
      },
    ],
    food: [
      {
        _id: false,
        id: String,
        name: String,
        qty: Number,
        price: Number,
      },
    ],
    amounts: {
      tickets: { type: Number, default: 0 },
      convenienceFee: { type: Number, default: 0 },
      gst: { type: Number, default: 0 },
      food: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    paymentMethod: String,
    contact: {
      email: String,
      phone: String,
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
reservationSchema.index({ showKey: 1, status: 1 });

module.exports = mongoose.model("Reservation", reservationSchema);
