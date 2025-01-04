const router = require('express').Router();
const { createReservation, getUserReservations } = require("../controller/movieReservationController");
const { verifyToken } = require('../utils/tokenVerification')

//create
router.post("/", verifyToken, createReservation);

// get movie by user
router.get("/", verifyToken, getUserReservations);

module.exports = router;