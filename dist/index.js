"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const hpp_1 = __importDefault(require("hpp"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const db_1 = __importDefault(require("./database/db"));
const movieModel_1 = __importDefault(require("./models/movieModel"));
const seedData_1 = require("./utils/seedData");
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const movieRoutes_1 = __importDefault(require("./routes/movieRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const movieReservationRoutes_1 = __importDefault(require("./routes/movieReservationRoutes"));
const showTimeRoutes_1 = __importDefault(require("./routes/showTimeRoutes"));
const reviewRoutes_1 = __importDefault(require("./routes/reviewRoutes"));
const paymentRoutes_1 = __importDefault(require("./routes/paymentRoutes"));
const paymentController_1 = require("./controller/paymentController");
const imageUpload_1 = __importDefault(require("./utils/imageUpload"));
if (!process.env.JWT_SECRET || !process.env.MONGO_URI) {
    console.error("Missing required environment variables: JWT_SECRET or MONGO_URI");
    process.exit(1);
}
if (process.env.NODE_ENV === "production" && process.env.JWT_SECRET.length < 32) {
    console.error("JWT_SECRET must be at least 32 characters in production");
    process.exit(1);
}
const projectRoot = fs_1.default.existsSync(path_1.default.join(__dirname, "package.json"))
    ? __dirname
    : path_1.default.resolve(__dirname, "..");
const app = (0, express_1.default)();
app.disable("x-powered-by");
// Trust first reverse proxy hop in cloud deployments (Render, Railway, Nginx, Docker, AWS ALB)
if (process.env.NODE_ENV === "production" || process.env.TRUST_PROXY === "true") {
    app.set("trust proxy", 1);
}
const PORT = Number(process.env.PORT) || 3000;
const DANGEROUS_KEYS = new Set(["__proto__", "constructor", "prototype"]);
// Recursive XSS & prototype-pollution sanitizer
const stripDangerousMarkup = (value) => {
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
        const record = value;
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
const sanitizeXss = (req, _res, next) => {
    if (req.body)
        req.body = stripDangerousMarkup(req.body);
    if (req.query)
        stripDangerousMarkup(req.query);
    if (req.params)
        stripDangerousMarkup(req.params);
    next();
};
// Security Headers with tailored CSP allowing posters, fonts, Stripe Elements, and YouTube trailer embeds
app.use((0, helmet_1.default)({
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
}));
const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://localhost:3000",
].filter((origin) => Boolean(origin));
app.use((0, cors_1.default)({
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
}));
// Stripe Webhook must receive raw unparsed JSON buffer for signature verification
app.post("/api/payments/webhook", express_1.default.raw({ type: "application/json", limit: "256kb" }), paymentController_1.handleStripeWebhook);
app.use(express_1.default.json({ limit: "100kb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "100kb" }));
app.use((0, cookie_parser_1.default)());
app.use((0, express_mongo_sanitize_1.default)());
app.use(sanitizeXss);
app.use((0, hpp_1.default)());
// Global API Rate Limiting
const apiLimiter = (0, express_rate_limit_1.default)({
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
app.use("/api/admin", adminRoutes_1.default);
app.use("/api/movie", movieRoutes_1.default);
app.use("/api/user", userRoutes_1.default);
app.use("/api/movieReservation", movieReservationRoutes_1.default);
app.use("/api/showtimes", showTimeRoutes_1.default);
app.use("/api/reviews", reviewRoutes_1.default);
app.use("/api/payments", paymentRoutes_1.default);
app.use("/api/upload", imageUpload_1.default);
// Uploaded media assets
app.use("/public", express_1.default.static(path_1.default.join(projectRoot, "public"), {
    dotfiles: "deny",
    index: false,
    maxAge: "7d",
    setHeaders: (res) => {
        res.setHeader("X-Content-Type-Options", "nosniff");
    },
}));
// Liveness & readiness health check
app.get("/health", (_req, res) => {
    const dbConnected = mongoose_1.default.connection.readyState === 1;
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
app.use("/api", (_req, res) => {
    res.status(404).json({ message: "API route not found" });
});
// Serve compiled React SPA in production (or whenever client/dist exists)
const clientDistPath = path_1.default.join(projectRoot, "client", "dist");
const clientIndexHtml = path_1.default.join(clientDistPath, "index.html");
if (process.env.SERVE_STATIC !== "false" && fs_1.default.existsSync(clientIndexHtml)) {
    app.use("/assets", express_1.default.static(path_1.default.join(clientDistPath, "assets"), {
        immutable: true,
        maxAge: "30d",
    }));
    app.use(express_1.default.static(clientDistPath, {
        index: false,
        maxAge: "1h",
    }));
    app.get("*", (req, res, next) => {
        if (req.path.startsWith("/api") || req.path.startsWith("/public")) {
            next();
            return;
        }
        res.setHeader("Cache-Control", "no-cache");
        res.sendFile(clientIndexHtml);
    });
}
// Fallback 404 handler
app.use((_req, res) => {
    res.status(404).json({ message: "Route not found" });
});
// Global error handler (never leaks internal stack traces or 500 error details)
app.use((err, _req, res, _next) => {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        res.status(400).json({ message: "Invalid JSON payload" });
        return;
    }
    if (err.message === "Not allowed by CORS") {
        res.status(403).json({ message: "Origin not permitted by CORS" });
        return;
    }
    console.error("Global error:", err);
    const status = typeof err.status === "number" && err.status >= 400 && err.status < 600 ? err.status : 500;
    const safeMessage = status < 500 ? err.message : "Internal server error";
    res.status(status).json({ message: safeMessage });
});
let httpServer = null;
const startServer = async () => {
    try {
        await (0, db_1.default)();
        if (process.env.AUTO_SEED !== "false") {
            try {
                const movies = await movieModel_1.default.find({}, "rating").lean();
                const needsSeed = movies.length === 0 ||
                    movies.some((m) => ["G", "PG", "PG-13", "R", "NC-17"].includes(m.rating));
                if (needsSeed) {
                    console.log("Seeding empty or legacy database with MovieBook catalog...");
                    await (0, seedData_1.seedDB)();
                }
            }
            catch (seedErr) {
                const msg = seedErr instanceof Error ? seedErr.message : String(seedErr);
                console.error("Auto-seed check error:", msg);
            }
        }
        httpServer = app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT} (${process.env.NODE_ENV || "development"})`);
        });
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("Database connection failed:", msg);
        process.exit(1);
    }
};
const gracefulShutdown = async (signal) => {
    console.log(`${signal} received — shutting down gracefully...`);
    try {
        if (httpServer) {
            await new Promise((resolve) => httpServer?.close(() => resolve()));
        }
        await mongoose_1.default.connection.close();
        console.log("HTTP server and MongoDB connection closed.");
        process.exit(0);
    }
    catch (err) {
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
process.on("unhandledRejection", (err) => {
    console.error("Unhandled Promise Rejection:", err);
    process.exit(1);
});
process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
    process.exit(1);
});
void startServer();
//# sourceMappingURL=index.js.map