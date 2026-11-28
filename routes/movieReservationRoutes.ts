import express from "express";
import {
  createReservation,
  getUserReservations,
  getOccupiedSeats,
  getReservationById,
  cancelReservation,
} from "../controller/movieReservationController";
import { verifyToken } from "../utils/tokenVerification";

const router = express.Router();

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

export default router;
