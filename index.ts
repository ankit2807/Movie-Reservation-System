import fs from "fs";
import path from "path";
import type { Server } from "http";
import express, { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import dotenv from "dotenv";

dotenv.config();

import connection from "./database/db";
import Movie from "./models/movieModel";
import { seedDB } from "./utils/seedData";
import adminRouter from "./routes/adminRoutes";
import movieRouter from "./routes/movieRoutes";
import userRouter from "./routes/userRoutes";
import movieReservationRouter from "./routes/movieReservationRoutes";
import showTimeRouter from "./routes/showTimeRoutes";
import reviewRouter from "./routes/reviewRoutes";
import paymentRouter from "./routes/paymentRoutes";
import { handleStripeWebhook } from "./controller/paymentController";
import uploadRouter from "./utils/imageUpload";

if (!process.env.JWT_SECRET || !process.env.MONGO_URI) {
  console.error("Missing required environment variables: JWT_SECRET or MONGO_URI");
  process.exit(1);
}

if (process.env.NODE_ENV === "production" && process.env.JWT_SECRET.length < 32) {
  console.error("JWT_SECRET must be at least 32 characters in production");
  process.exit(1);
}

const projectRoot = fs.existsSync(path.join(__dirname, "package.json"))
  ? __dirname
  : path.resolve(__dirname, "..");

const app = express();
app.disable("x-powered-by");

// Trust first reverse proxy hop in cloud deployments (Render, Railway, Nginx, Docker, AWS ALB)
if (process.env.NODE_ENV === "production" || process.env.TRUST_PROXY === "true") {
  app.set("trust proxy", 1);
}

const PORT = Number(process.env.PORT) || 3000;
const DANGEROUS_KEYS = new Set(["__proto__", "constructor", "prototype"]);

// Recursive XSS & prototype-pollution sanitizer
const stripDangerousMarkup = (value: unknown): unknown => {
  if (typeof value === "string") {
    return value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<\/?(?:iframe|object|embed|svg|math)\b[^>]*>/gi, "")
      .replace(/\bon\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
      .replace(/(?:javascript|vbscript|data\s*:\s*text\/html)\s*:/gi, "");
  }
  if (Array.isArray(value)) {
    return value.map(stripDangerousMarkup);
  }
  if (value && Object.prototype.toString.call(value) === "[object Object]") {
    const record = value as Record<string, unknown>;
    for (const key of Object.keys(record)) {
      if (DANGEROUS_KEYS.has(key)) {
        delete record[key];
        continue;
      }
      record[key] = stripDangerousMarkup(record[key]);
    }
  }
  return value;
};

const sanitizeXss = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.body) req.body = stripDangerousMarkup(req.body);
  if (req.query) stripDangerousMarkup(req.query);
  if (req.params) stripDangerousMarkup(req.params);
  next();
};

// Security Headers with tailored CSP allowing posters, fonts, Stripe Elements, and YouTube trailer embeds
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://js.stripe.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "https://image.tmdb.org",
          "https://*.bmscdn.com",
          "https://images.unsplash.com",
          "https://upload.wikimedia.org",
          "https://img.youtube.com",
          "https://i.ytimg.com",
          "https://placehold.co",
          "https://*.stripe.com",
        ],
        frameSrc: [
          "'self'",
          "https://www.youtube.com",
          "https://www.youtube-nocookie.com",
          "https://js.stripe.com",
          "https://hooks.stripe.com",
          "https://m.stripe.network",
        ],
        connectSrc: [
          "'self'",
          "https://api.themoviedb.org",
          "https://api.stripe.com",
          "https://m.stripe.network",
          "https://m.stripe.com",
        ],
        upgradeInsecureRequests: process.env.FORCE_HTTPS === "true" ? [] : null,
      },
    },
  })
);

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
  "http://localhost:3000",
].filter((origin): origin is string => Boolean(origin));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow same-origin requests, server-to-server health probes, and configured frontend URLs
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

// Stripe Webhook must receive raw unparsed JSON buffer for signature verification
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json", limit: "256kb" }),
  handleStripeWebhook
);

app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(sanitizeXss);
app.use(hpp());

// Global API Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 300 : 1500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many requests from this IP, please try again later.",
  },
});
app.use("/api", apiLimiter);

// API Routes
app.use("/api/admin", adminRouter);
app.use("/api/movie", movieRouter);
app.use("/api/user", userRouter);
app.use("/api/movieReservation", movieReservationRouter);
app.use("/api/showtimes", showTimeRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/upload", uploadRouter);

// Uploaded media assets
app.use(
  "/public",
  express.static(path.join(projectRoot, "public"), {
    dotfiles: "deny",
    index: false,
    maxAge: "7d",
    setHeaders: (res) => {
      res.setHeader("X-Content-Type-Options", "nosniff");
    },
  })
);

// Liveness & readiness health check
app.get("/health", (_req: Request, res: Response) => {
  const dbConnected = mongoose.connection.readyState === 1;
  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? "OK" : "DEGRADED",
    service: "MovieBook API",
    environment: process.env.NODE_ENV || "development",
    database: dbConnected ? "connected" : "disconnected",
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// Unknown API route 404 handler
app.use("/api", (_req: Request, res: Response) => {
  res.status(404).json({ message: "API route not found" });
});

// Serve compiled React SPA in production (or whenever client/dist exists)
const clientDistPath = path.join(projectRoot, "client", "dist");
const clientIndexHtml = path.join(clientDistPath, "index.html");

if (process.env.SERVE_STATIC !== "false" && fs.existsSync(clientIndexHtml)) {
  app.use(
    "/assets",
    express.static(path.join(clientDistPath, "assets"), {
      immutable: true,
      maxAge: "30d",
    })
  );
  app.use(
    express.static(clientDistPath, {
      index: false,
      maxAge: "1h",
    })
  );
  app.get("*", (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/public")) {
      next();
      return;
    }
    res.setHeader("Cache-Control", "no-cache");
    res.sendFile(clientIndexHtml);
  });
}

// Fallback 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

interface HttpError extends Error {
  status?: number;
  body?: unknown;
}

// Global error handler (never leaks internal stack traces or 500 error details)
app.use((err: HttpError, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    res.status(400).json({ message: "Invalid JSON payload" });
    return;
  }
  if (err.message === "Not allowed by CORS") {
    res.status(403).json({ message: "Origin not permitted by CORS" });
    return;
  }
  console.error("Global error:", err);
  const status =
    typeof err.status === "number" && err.status >= 400 && err.status < 600 ? err.status : 500;
  const safeMessage = status < 500 ? err.message : "Internal server error";
  res.status(status).json({ message: safeMessage });
});

let httpServer: Server | null = null;

const startServer = async (): Promise<void> => {
  try {
    await connection();
    if (process.env.AUTO_SEED !== "false") {
      try {
        const movies = await Movie.find({}, "rating").lean();
        const needsSeed =
          movies.length === 0 ||
          movies.some((m) => ["G", "PG", "PG-13", "R", "NC-17"].includes(m.rating));
        if (needsSeed) {
          console.log("Seeding empty or legacy database with MovieBook catalog...");
          await seedDB();
        }
      } catch (seedErr: unknown) {
        const msg = seedErr instanceof Error ? seedErr.message : String(seedErr);
        console.error("Auto-seed check error:", msg);
      }
    }

    httpServer = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT} (${process.env.NODE_ENV || "development"})`);
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Database connection failed:", msg);
    process.exit(1);
  }
};

const gracefulShutdown = async (signal: string): Promise<void> => {
  console.log(`${signal} received — shutting down gracefully...`);
  try {
    if (httpServer) {
      await new Promise<void>((resolve) => httpServer?.close(() => resolve()));
    }
    await mongoose.connection.close();
    console.log("HTTP server and MongoDB connection closed.");
    process.exit(0);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Error during graceful shutdown:", msg);
    process.exit(1);
  }
};

process.on("SIGTERM", () => {
  void gracefulShutdown("SIGTERM");
});
process.on("SIGINT", () => {
  void gracefulShutdown("SIGINT");
});

process.on("unhandledRejection", (err: unknown) => {
  console.error("Unhandled Promise Rejection:", err);
  process.exit(1);
});

process.on("uncaughtException", (err: Error) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

void startServer();
