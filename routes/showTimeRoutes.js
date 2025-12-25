const router = require("express").Router();
const {
  addShowTime,
  getShowTimeById,
  getShowTimes,
  updateShowTimeById,
  deleteShowTime,
} = require("../controller/showTimeController");
const { verifyTokenAndAdmin } = require("../utils/tokenVerification");

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

module.exports = router;
