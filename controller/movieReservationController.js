const Reservation = require('../models/movieReservationModel');

//create reservation
const createReservation = async (req, res) => {

    const newReservation = new Reservation(req.body);
    try {
        const savedReservation = await newReservation.save();
        return res.status(201).json(savedReservation);
    } catch (err) {
        return res.status(500).json(err);
    }
};

//get reservations by userId
const getUserReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find({ user: req.user.id }).populate('movie');
        return res.status(200).json(reservations);
    } catch (err) {
        return res.status(500).json(err);
    }
};

module.exports = {
    createReservation,
    getUserReservations
}