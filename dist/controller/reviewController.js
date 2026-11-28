"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMovieReviews = exports.addReview = void 0;
const reviewModel_1 = __importDefault(require("../models/reviewModel"));
const addReview = async (req, res) => {
    try {
        const { movieId, rating, comment } = req.body;
        const userId = req.user?.id || req.user?._id;
        if (!userId) {
            return res.status(401).json({ status: "fail", message: "Please log in to submit a review" });
        }
        if (!movieId || String(movieId).trim().length === 0) {
            return res.status(400).json({ status: "fail", message: "movieId is required" });
        }
        const cleanRating = Math.min(10, Math.max(1, Number(rating) || 8));
        const cleanComment = String(comment || "").trim().slice(0, 1000) || "Great movie experience!";
        const cleanMovieId = String(movieId).slice(0, 80);
        const review = await reviewModel_1.default.findOneAndUpdate({ movieId: cleanMovieId, user: userId }, {
            movieId: cleanMovieId,
            user: userId,
            rating: cleanRating,
            comment: cleanComment,
        }, { new: true, upsert: true, runValidators: true }).populate("user", "name");
        return res.status(201).json({
            status: "success",
            data: review,
        });
    }
    catch (err) {
        const e = err;
        if (e.code === 11000) {
            return res
                .status(409)
                .json({ status: "fail", message: "You have already reviewed this movie" });
        }
        if (e.name === "ValidationError") {
            return res.status(400).json({ status: "fail", message: e.message || "Validation error" });
        }
        console.error("Add review error:", err);
        return res.status(500).json({ status: "fail", message: "Internal server error" });
    }
};
exports.addReview = addReview;
const getMovieReviews = async (req, res) => {
    try {
        const movieId = String(req.params.movieId || "").slice(0, 80);
        const reviews = await reviewModel_1.default.find({ movieId })
            .populate("user", "name")
            .sort({ createdAt: -1 });
        return res.status(200).json({
            status: "success",
            data: reviews,
        });
    }
    catch (err) {
        console.error("Get reviews error:", err);
        return res.status(500).json({ status: "fail", message: "Internal server error" });
    }
};
exports.getMovieReviews = getMovieReviews;
//# sourceMappingURL=reviewController.js.map