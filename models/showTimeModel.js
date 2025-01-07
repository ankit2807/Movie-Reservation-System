const mongoose = require('mongoose');

const showTimeSchema = new mongoose.Schema({
    startAt: {
        type: String,
        required: true,
        trim: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    movieId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
        required: true,
    },
}, { timestamps: true }
);

module.exports = mongoose.model("ShowTime", showTimeSchema);