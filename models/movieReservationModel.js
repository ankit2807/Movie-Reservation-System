const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    movie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie'
    },
    showtime: {
        type: String
    },
    seats: [{
        type: String
    }], // e.g., ['A1', 'A2']
});

module.exports = mongoose.model('Reservation', reservationSchema);