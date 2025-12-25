const router = require("express").Router();
const {
  createReservation,
  getUserReservations,
} = require("../controller/movieReservationController");
const { verifyToken } = require("../utils/tokenVerification");

// Create a new reservation (requires user token)
router.post("/", verifyToken, createReservation);

// Get reservations for the logged-in user (requires user token)
router.get("/", verifyToken, getUserReservations);

module.exports = router;
