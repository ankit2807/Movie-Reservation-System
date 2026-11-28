import express from "express";
import { addReview, getMovieReviews } from "../controller/reviewController";
import { verifyToken } from "../utils/tokenVerification";

const router = express.Router();

router.post("/", verifyToken, addReview);
router.get("/:movieId", getMovieReviews);

export default router;
