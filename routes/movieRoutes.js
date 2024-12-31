const router = require('express').Router();
const { addMovie, updateMovie, deleteMovie, getMovieById, getMovies, } = require("../controller/movieController");
const { verifyTokenAndAdmin } = require('../utils/tokenVerification')

//create
router.post("/", verifyTokenAndAdmin, addMovie);

//update
router.put("/:id", verifyTokenAndAdmin, updateMovie);

//delete
router.delete("/:id", verifyTokenAndAdmin, deleteMovie);

//get single products
router.get("/find/:id", getMovieById);

//get all products
router.get("/", getMovies);

module.exports = router;