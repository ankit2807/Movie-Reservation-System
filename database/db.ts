import mongoose from "mongoose";

mongoose.set("strictQuery", true);

const connection = async (): Promise<void> => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error("MONGO_URI environment variable is not defined");
    }
    await mongoose.connect(uri);
    console.log("Database connected");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Could not connect to database:", message);
    throw error;
  }
};

export default connection;
