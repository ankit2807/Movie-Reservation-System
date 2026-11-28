import express from "express";
import {
  addShowTime,
  getShowTimeById,
  getShowTimes,
  updateShowTimeById,
  deleteShowTime,
} from "../controller/showTimeController";
import { verifyTokenAndAdmin } from "../utils/tokenVerification";

const router = express.Router();

// Add a new showtime (requires admin token)
router.post("/", verifyTokenAndAdmin, addShowTime);

// Update a showtime by ID (requires admin token)
router.put("/:id", verifyTokenAndAdmin, updateShowTimeById);

// Delete a showtime by ID (requires admin token)
router.delete("/:id", verifyTokenAndAdmin, deleteShowTime);

// Get a showtime by ID (public)
router.get("/find/:id", getShowTimeById);

// Get all showtimes (public)
router.get("/", getShowTimes);

export default router;
