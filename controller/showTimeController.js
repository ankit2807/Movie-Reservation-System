const ShowTime = require('../models/showTimeModel');

// Create a showtime
const addShowTime = async (req, res) => {
    const showtime = new ShowTime(req.body);
    try {
        await showtime.save();
        res.status(201).send(showtime);
    } catch (err) {
        return res.status(500).json(err);
    }
};

// Get all showtimes
const getShowTimes = async (req, res) => {
    try {
        const showtimes = await ShowTime.find({});
        res.send(showtimes);
    } catch (err) {
        return res.status(500).json(err);
    }
};

// Get showtime by id
const getShowTimeById = async (req, res) => {
    const _id = req.params.id;
    try {
        const showtime = await ShowTime.findById(_id);
        return !showtime ? res.sendStatus(404) : res.send(showtime);
    } catch (err) {
        return res.status(500).json(err);
    }
};

// Update showtime by id
const updateShowTimeById = async (req, res) => {
    const _id = req.params.id;
    const updates = Object.keys(req.body);
    const allowedUpdates = ['startAt', 'startDate', 'endDate', 'movieId'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) return res.status(400).send({ error: 'Invalid updates!' });

    try {
        const showtime = await ShowTime.findById(_id);
        updates.forEach((update) => (showtime[update] = req.body[update]));
        await showtime.save();
        return !showtime ? res.sendStatus(404) : res.send(showtime);
    } catch (err) {
        return res.status(500).json(err);
    }
};

// Delete showtime by id
const deleteShowTime = async (req, res) => {
    const _id = req.params.id;
    try {
        const showtime = await ShowTime.findByIdAndDelete(_id);
        return !showtime ? res.sendStatus(404) : res.send(showtime);
    } catch (err) {
        return res.status(500).json(err);
    }
};

module.exports = {
    addShowTime,
    getShowTimes,
    getShowTimeById,
    updateShowTimeById,
    deleteShowTime
} 