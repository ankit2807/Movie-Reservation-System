const router = require("express").Router();
const {
  createReservation,
  getUserReservations,
  getOccupiedSeats,
  getReservationById,
  cancelReservation,
} = require("../controller/movieReservationController");
const { verifyToken } = require("../utils/tokenVerification");

// Create a new reservation (requires user token)
router.post("/", verifyToken, createReservation);

// Get reservations for the logged-in user (requires user token)
router.get("/", verifyToken, getUserReservations);

// Get occupied seats for a showtime and date (public)
router.get("/occupied", getOccupiedSeats);

// Get a single reservation by Mongo id or booking id (requires user token)
router.get("/:id", verifyToken, getReservationById);

// Cancel a reservation (requires user token)
router.patch("/:id/cancel", verifyToken, cancelReservation);

module.exports = router;
