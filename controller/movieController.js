const Movie = require("../models/movieModel");

/**
 * Add a new movie.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const addMovie = async (req, res) => {
  try {
    const newMovie = new Movie(req.body);
    const savedMovie = await newMovie.save();
    return res.status(201).json(savedMovie);
  } catch (err) {
    console.error("Add movie error:", err);
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ message: "Movie with this title already exists" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Update a movie by ID.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateMovie = async (req, res) => {
  try {
    const updatedMovie = await Movie.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updatedMovie) {
      return res.status(404).json({ message: "Movie not found" });
    }
    return res.status(200).json(updatedMovie);
  } catch (err) {
    console.error("Update movie error:", err);
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Delete a movie by ID.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteMovie = async (req, res) => {
  try {
    const deletedMovie = await Movie.findByIdAndDelete(req.params.id);
    if (!deletedMovie) {
      return res.status(404).json({ message: "Movie not found" });
    }
    return res.status(200).json({ message: "Movie deleted successfully" });
  } catch (err) {
    console.error("Delete movie error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get a movie by ID.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }
    return res.status(200).json(movie);
  } catch (err) {
    console.error("Get movie error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get all movies, optionally sorted by newest.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getMovies = async (req, res) => {
  try {
    const qNew = req.query.new;
    let movies;

    if (qNew) {
      movies = await Movie.find().sort({ createdAt: -1 });
    } else {
      movies = await Movie.find();
    }
    return res.status(200).json(movies);
  } catch (err) {
    console.error("Get movies error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  addMovie,
  updateMovie,
  deleteMovie,
  getMovieById,
  getMovies,
};
