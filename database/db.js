const mongoose = require('mongoose');

const connection = () => {
    try {
        mongoose.connect(process.env.MONGO_URL);
        console.log('Database connected');
    } catch (error) {
        console.log('Could not connect to database');
    }
};

module.exports = connection;