const Review = require('../models/reviewModel');

exports.addReview = async (req, res) => {
    try {
        const { movieId, rating, comment } = req.body;
        const userId = req.user?.id || req.user?._id;

        if (!userId) {
            return res.status(401).json({ status: 'fail', message: 'Please log in to submit a review' });
        }

        const review = await Review.findOneAndUpdate(
            { movieId: String(movieId), user: userId },
            {
                movieId: String(movieId),
                user: userId,
                rating: Number(rating) || 8,
                comment: comment || 'Great movie experience!'
            },
            { new: true, upsert: true, runValidators: true }
        ).populate('user', 'name');

        res.status(201).json({
            status: 'success',
            data: review
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ status: 'fail', message: 'You have already reviewed this movie' });
        }
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

exports.getMovieReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ movieId: String(req.params.movieId) })
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
