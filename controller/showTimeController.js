const ShowTime = require("../models/showTimeModel");
const Movie = require("../models/movieModel");

const ALLOWED_SHOWTIME_FIELDS = [
  "movieId",
  "theatre",
  "screen",
  "format",
  "price",
  "startAt",
  "startDate",
  "endDate",
];

/**
 * Add a new showtime (admin only).
 */
const addShowTime = async (req, res) => {
  try {
    const { movieId, startAt } = req.body;

    if (!movieId || !/^[0-9a-fA-F]{24}$/.test(String(movieId))) {
      return res.status(400).json({ message: "Valid movieId is required" });
    }

    const movie = await Movie.findById(String(movieId));
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    const existingShowtime = await ShowTime.findOne({
      movieId: String(movieId),
      startAt: String(startAt || "").trim(),
      theatre: String(req.body.theatre || "PVR: Logix City Centre Mall, Noida").trim(),
    });
    if (existingShowtime) {
      return res.status(409).json({
        message: "Showtime already exists for this movie, theatre, and start time",
      });
    }

    const payload = {};
    for (const key of ALLOWED_SHOWTIME_FIELDS) {
      if (req.body[key] !== undefined) payload[key] = req.body[key];
    }

    const showtime = new ShowTime(payload);
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
 */
const getShowTimes = async (_req, res) => {
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
 */
const getShowTimeById = async (req, res) => {
  try {
    const { id } = req.params;
    if (id && id.startsWith("bms__")) {
      const parts = id.split("__");
      const movieId = parts[1];
      const movie = /^[0-9a-fA-F]{24}$/.test(movieId)
        ? await Movie.findById(movieId)
        : await Movie.findOne({});
      if (!movie) {
        return res.status(404).json({ message: "Showtime movie not found" });
      }
      return res.status(200).json({
        _id: id,
        startAt: "07:30 PM",
        format: "2D",
        price: 290,
        theatre: parts[2] || "PVR: Logix City Centre Mall, Noida",
        screen: "AUDI 01",
        movieId: movie,
      });
    }
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(404).json({ message: "Showtime not found" });
    }
    const showtime = await ShowTime.findById(id).populate("movieId");
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
 * Update a showtime by ID (admin only).
 */
const updateShowTimeById = async (req, res) => {
  if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
    return res.status(400).json({ message: "Invalid showtime ID" });
  }

  const updates = Object.keys(req.body || {});
  const isValidOperation =
    updates.length > 0 && updates.every((update) => ALLOWED_SHOWTIME_FIELDS.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({ message: "Invalid updates!" });
  }

  try {
    const showtime = await ShowTime.findById(req.params.id);
    if (!showtime) {
      return res.status(404).json({ message: "Showtime not found" });
    }

    updates.forEach((update) => {
      showtime[update] = req.body[update];
    });
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
 * Delete a showtime by ID (admin only).
 */
const deleteShowTime = async (req, res) => {
  try {
    if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
      return res.status(400).json({ message: "Invalid showtime ID" });
    }
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
