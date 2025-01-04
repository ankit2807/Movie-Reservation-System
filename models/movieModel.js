const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        maxLength: [30, "Title name cannot exceed 30 characters"],
        minLength: [1, "Title name should have more than 1 characters"]
    },
    description: {
        type: String,
        required: true,
        unique: true,
        maxLength: [100, "Description cannot exceed 100 characters"],
        minLength: [4, "Description should have more than 4 characters"]
    },
    posterImage: {
        type: String,
        default: "",
    },
    duration: {
        type: String,
        required: true
    },
    genre: {
        type: String,
        required: true
    },
    rating: {
        type: String,
        required: true
    },
    releaseDate: {
        type: String,
        required: true
    },
    certification: {
        type: String,
        required: true
    },
    showtimes: [{
        type: Date,
        required: true
    }],
}, { timestamps: true }
);

module.exports = mongoose.model("Movie", movieSchema);