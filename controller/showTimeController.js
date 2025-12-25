const ShowTime = require("../models/showTimeModel");
const Movie = require("../models/movieModel");

/**
 * Add a new showtime.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const addShowTime = async (req, res) => {
  try {
    const { movieId } = req.body;

    // Check if movie exists
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    const showtime = new ShowTime(req.body);
    const savedShowtime = await showtime.save();
    return res.status(201).json(savedShowtime);
  } catch (err) {
    console.error("Add showtime error:", err);
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get all showtimes.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getShowTimes = async (req, res) => {
  try {
    const showtimes = await ShowTime.find({}).populate("movieId");
    return res.status(200).json(showtimes);
  } catch (err) {
    console.error("Get showtimes error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get a showtime by ID.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getShowTimeById = async (req, res) => {
  try {
    const showtime = await ShowTime.findById(req.params.id).populate("movieId");
    if (!showtime) {
      return res.status(404).json({ message: "Showtime not found" });
    }
    return res.status(200).json(showtime);
  } catch (err) {
    console.error("Get showtime error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Update a showtime by ID.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateShowTimeById = async (req, res) => {
  const allowedUpdates = ["startAt", "startDate", "endDate", "movieId"];
  const updates = Object.keys(req.body);
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).json({ message: "Invalid updates!" });
  }

  try {
    const showtime = await ShowTime.findById(req.params.id);
    if (!showtime) {
      return res.status(404).json({ message: "Showtime not found" });
    }

    updates.forEach((update) => (showtime[update] = req.body[update]));
    await showtime.save();
    return res.status(200).json(showtime);
  } catch (err) {
    console.error("Update showtime error:", err);
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Delete a showtime by ID.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteShowTime = async (req, res) => {
  try {
    const deletedShowtime = await ShowTime.findByIdAndDelete(req.params.id);
    if (!deletedShowtime) {
      return res.status(404).json({ message: "Showtime not found" });
    }
    return res.status(200).json({ message: "Showtime deleted successfully" });
  } catch (err) {
    console.error("Delete showtime error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  addShowTime,
  getShowTimes,
  getShowTimeById,
  updateShowTimeById,
  deleteShowTime,
};
