const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");
require("dotenv").config();

const connection = require("./database/db");
const adminRouter = require("./routes/adminRoutes");
const movieRouter = require("./routes/movieRoutes");
const userRouter = require("./routes/userRoutes");
const movieReservationRouter = require("./routes/movieReservationRoutes");
const showTimeRouter = require("./routes/showTimeRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const uploadRouter = require("./utils/imageUpload");

// Check for required environment variables
if (!process.env.JWT_SECRET || !process.env.MONGO_URI) {
  console.error("Missing required environment variables: JWT_SECRET or MONGO_URI");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Recursive XSS sanitizer replacing deprecated `xss-clean`
const stripDangerousMarkup = (value) => {
  if (typeof value === "string") {
    return value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/\bon\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
      .replace(/javascript\s*:/gi, "");
  }
  if (Array.isArray(value)) {
    return value.map(stripDangerousMarkup);
  }
  if (value && typeof value === "object") {
    for (const key of Object.keys(value)) {
      value[key] = stripDangerousMarkup(value[key]);
    }
  }
  return value;
};

const sanitizeXss = (req, _res, next) => {
  if (req.body) req.body = stripDangerousMarkup(req.body);
  if (req.query) stripDangerousMarkup(req.query);
  if (req.params) stripDangerousMarkup(req.params);
  next();
};

// Security & Parsing Middleware
app.use(helmet());
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL,
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:3000",
    ].filter(Boolean),
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(sanitizeXss);
app.use(hpp());

// Global Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 200 : 1500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many requests from this IP, please try again later.",
  },
});
app.use(limiter);

// API Routes
app.use("/api/admin", adminRouter);
app.use("/api/movie", movieRouter);
app.use("/api/user", userRouter);
app.use("/api/movieReservation", movieReservationRouter);
app.use("/api/showtimes", showTimeRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/upload", uploadRouter);
app.use("/public", express.static("public"));

// Health check route
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

// 404 handler (Express 4 & 5 compatible)
app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error("Global error:", err);
  res.status(err.status || 500).json({ message: err.message || "Internal server error" });
});

// Connect to database, ensure catalog is seeded, then start server
const startServer = async () => {
  try {
    await connection();
    try {
      const Movie = require("./models/movieModel");
      const { seedDB } = require("./utils/seedData");
      const movies = await Movie.find().lean();
      const needsSeed =
        movies.length === 0 ||
        movies.some((m) => ["G", "PG", "PG-13", "R", "NC-17"].includes(m.rating)) ||
        !movies.some((m) => m.title === "Ramayana: Rise of a Legend");
      if (needsSeed) {
        console.log("Seeding database with latest late-2026 MovieBook catalog...");
        await seedDB();
      }
    } catch (seedErr) {
      console.error("Auto-seed check error:", seedErr.message);
    }

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  }
};

startServer();

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});
