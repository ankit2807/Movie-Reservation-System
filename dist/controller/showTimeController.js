"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteShowTime = exports.updateShowTimeById = exports.getShowTimeById = exports.getShowTimes = exports.addShowTime = void 0;
const showTimeModel_1 = __importDefault(require("../models/showTimeModel"));
const movieModel_1 = __importDefault(require("../models/movieModel"));
const ALLOWED_SHOWTIME_FIELDS = [
    "movieId",
    "theatre",
    "screen",
    "format",
    "price",
    "startAt",
    "startDate",
    "endDate",
];
const isAllowedField = (key) => ALLOWED_SHOWTIME_FIELDS.includes(key);
/**
 * Add a new showtime (admin only).
 */
const addShowTime = async (req, res) => {
    try {
        const body = req.body;
        const { movieId, startAt } = body;
        if (!movieId || !/^[0-9a-fA-F]{24}$/.test(String(movieId))) {
            return res.status(400).json({ message: "Valid movieId is required" });
        }
        const movie = await movieModel_1.default.findById(String(movieId));
        if (!movie) {
            return res.status(404).json({ message: "Movie not found" });
        }
        const existingShowtime = await showTimeModel_1.default.findOne({
            movieId: String(movieId),
            startAt: String(startAt || "").trim(),
            theatre: String(body.theatre || "PVR: Logix City Centre Mall, Noida").trim(),
        });
        if (existingShowtime) {
            return res.status(409).json({
                message: "Showtime already exists for this movie, theatre, and start time",
            });
        }
        const payload = {};
        for (const key of ALLOWED_SHOWTIME_FIELDS) {
            if (body[key] !== undefined)
                payload[key] = body[key];
        }
        const showtime = new showTimeModel_1.default(payload);
        const savedShowtime = await showtime.save();
        return res.status(201).json(savedShowtime);
    }
    catch (err) {
        console.error("Add showtime error:", err);
        const e = err;
        if (e.name === "ValidationError") {
            return res.status(400).json({ message: e.message || "Validation error" });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.addShowTime = addShowTime;
/**
 * Get all showtimes.
 */
const getShowTimes = async (_req, res) => {
    try {
        const showtimes = await showTimeModel_1.default.find({}).populate("movieId");
        return res.status(200).json(showtimes);
    }
    catch (err) {
        console.error("Get showtimes error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.getShowTimes = getShowTimes;
/**
 * Get a showtime by ID.
 */
const getShowTimeById = async (req, res) => {
    try {
        const id = String(req.params.id || "");
        if (id.startsWith("bms__")) {
            const parts = id.split("__");
            const movieId = parts[1] || "";
            const movie = /^[0-9a-fA-F]{24}$/.test(movieId)
                ? await movieModel_1.default.findById(movieId)
                : await movieModel_1.default.findOne({});
            if (!movie) {
                return res.status(404).json({ message: "Showtime movie not found" });
            }
            return res.status(200).json({
                _id: id,
                startAt: "07:30 PM",
                format: "2D",
                price: 290,
                theatre: parts[2] || "PVR: Logix City Centre Mall, Noida",
                screen: "AUDI 01",
                movieId: movie,
            });
        }
        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            return res.status(404).json({ message: "Showtime not found" });
        }
        const showtime = await showTimeModel_1.default.findById(id).populate("movieId");
        if (!showtime) {
            return res.status(404).json({ message: "Showtime not found" });
        }
        return res.status(200).json(showtime);
    }
    catch (err) {
        console.error("Get showtime error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.getShowTimeById = getShowTimeById;
/**
 * Update a showtime by ID (admin only).
 */
const updateShowTimeById = async (req, res) => {
    const id = String(req.params.id || "");
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
        return res.status(400).json({ message: "Invalid showtime ID" });
    }
    const body = (req.body || {});
    const updates = Object.keys(body);
    const isValidOperation = updates.length > 0 && updates.every(isAllowedField);
    if (!isValidOperation) {
        return res.status(400).json({ message: "Invalid updates!" });
    }
    try {
        const showtime = await showTimeModel_1.default.findById(id);
        if (!showtime) {
            return res.status(404).json({ message: "Showtime not found" });
        }
        for (const update of updates) {
            showtime.set(update, body[update]);
        }
        await showtime.save();
        return res.status(200).json(showtime);
    }
    catch (err) {
        console.error("Update showtime error:", err);
        const e = err;
        if (e.name === "ValidationError") {
            return res.status(400).json({ message: e.message || "Validation error" });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.updateShowTimeById = updateShowTimeById;
/**
 * Delete a showtime by ID (admin only).
 */
const deleteShowTime = async (req, res) => {
    try {
        const id = String(req.params.id || "");
        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            return res.status(400).json({ message: "Invalid showtime ID" });
        }
        const deletedShowtime = await showTimeModel_1.default.findByIdAndDelete(id);
        if (!deletedShowtime) {
            return res.status(404).json({ message: "Showtime not found" });
        }
        return res.status(200).json({ message: "Showtime deleted successfully" });
    }
    catch (err) {
        console.error("Delete showtime error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.deleteShowTime = deleteShowTime;
//# sourceMappingURL=showTimeController.js.map