const router = require('express').Router();
const { addMovie, updateMovie, deleteMovie, getMovieById, getMovies, } = require("../controller/movieController");
const { verifyTokenAndAdmin } = require('../utils/tokenVerification')

//create
router.post("/", verifyTokenAndAdmin, addMovie);

//update
router.put("/:id", verifyTokenAndAdmin, updateMovie);

//delete
router.delete("/:id", verifyTokenAndAdmin, deleteMovie);

//get movie by Id
router.get("/find/:id", getMovieById);

//get all movies
router.get("/", getMovies);

module.exports = router;