const router = require("express").Router();
const {
  addMovie,
  updateMovie,
  deleteMovie,
  getMovieById,
  getMovies,
} = require("../controller/movieController");
const { verifyTokenAndAdmin } = require("../utils/tokenVerification");

// Add a new movie (requires admin token)
router.post("/", verifyTokenAndAdmin, addMovie);

// Update a movie by ID (requires admin token)
router.put("/:id", verifyTokenAndAdmin, updateMovie);

// Delete a movie by ID (requires admin token)
router.delete("/:id", verifyTokenAndAdmin, deleteMovie);

// Get a movie by ID (public)
router.get("/find/:id", getMovieById);

// Get all movies (public)
router.get("/", getMovies);

module.exports = router;
