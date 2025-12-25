const express = require("express");
const app = express();
require("dotenv").config();
const connection = require("./database/db");
const adminRouter = require("./routes/adminRoutes");
const movieRouter = require("./routes/movieRoutes");
const userRouter = require("./routes/userRoutes");
const movieReservationRouter = require("./routes/movieReservationRoutes");
const showTimeRouter = require("./routes/showTimeRoutes");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// Check for required environment variables
if (!process.env.JWT_SECRET || !process.env.MONGO_URI) {
  console.error(
    "Missing required environment variables: JWT_SECRET or MONGO_URI"
  );
  process.exit(1);
}

// Connect to database with error handling
connection().catch((err) => {
  console.error("Database connection failed:", err);
  process.exit(1);
});

// Middleware
app.use(helmet()); // Security headers
app.use(express.json({ limit: "10mb" })); // Limit JSON payload size
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    message: "Too many requests from this IP, please try again later.",
  },
});
app.use(limiter);

// Routes
app.use("/api/admin", adminRouter);
app.use("/api/movie", movieRouter);
app.use("/api/user", userRouter);
app.use("/api/movieReservation", movieReservationRouter);
app.use("/api/showtimes", showTimeRouter);

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error:", err);
  res.status(500).json({ message: "Internal server error" });
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

// Port
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
