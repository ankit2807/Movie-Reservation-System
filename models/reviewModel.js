const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    movieId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
        required: [true, 'Review must belong to a movie']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user']
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, 'Rating is required']
    },
    comment: {
        type: String,
        required: [true, 'Review text is required'],
        trim: true
    }
}, { timestamps: true });

// Prevent duplicate reviews from same user for same movie
reviewSchema.index({ movieId: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
