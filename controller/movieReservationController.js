const Reservation = require("../models/movieReservationModel");
const ShowTime = require("../models/showTimeModel");

/**
 * Create a new reservation.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createReservation = async (req, res) => {
  try {
    const { user, movie, showtime, seats } = req.body;

    // Basic validation
    if (!user || !movie || !showtime || !seats || seats.length === 0) {
      return res
        .status(400)
        .json({ message: "All fields are required and seats cannot be empty" });
    }

    // Check if showtime exists
    const existingShowtime = await ShowTime.findById(showtime);
    if (!existingShowtime) {
      return res.status(404).json({ message: "Showtime not found" });
    }

    // Check for seat conflicts (simplified, in real app use transactions)
    const conflictingReservations = await Reservation.find({
      showtime,
      seats: { $in: seats },
    });
    if (conflictingReservations.length > 0) {
      return res
        .status(409)
        .json({ message: "Some seats are already reserved" });
    }

    const newReservation = new Reservation(req.body);
    const savedReservation = await newReservation.save();
    return res.status(201).json(savedReservation);
  } catch (err) {
    console.error("Create reservation error:", err);
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get reservations for the logged-in user.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ user: req.user.id })
      .populate("movie")
      .populate("showtime");
    return res.status(200).json(reservations);
  } catch (err) {
    console.error("Get user reservations error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createReservation,
  getUserReservations,
};
