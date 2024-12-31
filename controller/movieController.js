const Movie = require('../models/movieModel');

//Create
const addMovie = async (req, res) => {
    const newProduct = new Movie(req.body);
    try {
        const savedProduct = await newProduct.save();
        return res.status(200).json(savedProduct);
    } catch (err) {
        return res.status(500).json(err);
    }
};

//Update
const updateMovie = async (req, res) => {
    try {
        const updatedMovie = await Movie.findByIdAndUpdate(req.params.id,
            {
                $set: req.body
            },
            { new: true }
        );
        return res.status(200).json(updatedMovie);
    } catch (err) {
        return res.status(500).json(err);
    }
};

//Delete
const deleteMovie = async (req, res) => {
    try {
        await Movie.findByIdAndDelete(req.params.id);
        return res.status(200).json("Movie deleted...");
    } catch (err) {
        return res.status(500).json(err);
    }
};

//Get Movie
const getMovieById = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        return res.status(200).json(movie);
    } catch (err) {
        return res.status(500).json(err);
    }
};

//Get all movies
const getMovies = async (req, res) => {
    const qNew = req.query.new;
    try {
        let movies;

        if (qNew) {
            movies = await Movie.find().sort({ createdAt: -1 });
        } else {
            movies = await Movie.find();
        }
        return res.status(200).json(movies);
    } catch (err) {
        return res.status(500).json(err);
    }
};

module.exports = {
    addMovie,
    updateMovie,
    deleteMovie,
    getMovieById,
    getMovies,
}