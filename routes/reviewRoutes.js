const express = require('express');
const router = express.Router();
const reviewController = require('../controller/reviewController');
const { verifyToken } = require('../utils/tokenVerification');

router.post('/', verifyToken, reviewController.addReview);
router.get('/:movieId', reviewController.getMovieReviews);

module.exports = router;
