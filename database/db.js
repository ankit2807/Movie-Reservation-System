const mongoose = require("mongoose");

const connection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database connected");
  } catch (error) {
    console.log("Could not connect to database:", error.message);
    throw error;
  }
};

module.exports = connection;
