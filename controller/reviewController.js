const Review = require("../models/reviewModel");

exports.addReview = async (req, res) => {
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

    const review = await Review.findOneAndUpdate(
      { movieId: String(movieId).slice(0, 80), user: userId },
      {
        movieId: String(movieId).slice(0, 80),
        user: userId,
        rating: cleanRating,
        comment: cleanComment,
      },
      { new: true, upsert: true, runValidators: true }
    ).populate("user", "name");

    return res.status(201).json({
      status: "success",
      data: review,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ status: "fail", message: "You have already reviewed this movie" });
    }
    if (err.name === "ValidationError") {
      return res.status(400).json({ status: "fail", message: err.message });
    }
    console.error("Add review error:", err);
    return res.status(500).json({ status: "fail", message: "Internal server error" });
  }
};

exports.getMovieReviews = async (req, res) => {
  try {
    const movieId = String(req.params.movieId || "").slice(0, 80);
    const reviews = await Review.find({ movieId })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: "success",
      data: reviews,
    });
  } catch (err) {
    console.error("Get reviews error:", err);
    return res.status(500).json({ status: "fail", message: "Internal server error" });
  }
};
