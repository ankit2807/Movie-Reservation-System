const mongoose = require("mongoose");

mongoose.set("strictQuery", true);

const connection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database connected");
  } catch (error) {
    console.error("Could not connect to database:", error.message);
    throw error;
  }
};

module.exports = connection;
