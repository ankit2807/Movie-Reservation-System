const Review = require('../models/reviewModel');
const Movie = require('../models/movieModel');

exports.addReview = async (req, res) => {
    try {
        const { movieId, rating, comment } = req.body;

        // Check if movie exists
        const movie = await Movie.findById(movieId);
        if (!movie) {
            return res.status(404).json({ status: 'fail', message: 'Movie not found' });
        }

        const review = await Review.create({
            movieId,
            user: req.user._id,
            rating,
            comment
        });

        res.status(201).json({
            status: 'success',
            data: review
        });
    } catch (err) {
        // Handle duplicate review error
        if (err.code === 11000) {
            return res.status(400).json({ status: 'fail', message: 'You have already reviewed this movie' });
        }
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

exports.getMovieReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ movieId: req.params.movieId })
            .populate('user', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({
            status: 'success',
            data: reviews
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};
