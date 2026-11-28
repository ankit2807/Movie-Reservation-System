"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const movieReservationController_1 = require("../controller/movieReservationController");
const tokenVerification_1 = require("../utils/tokenVerification");
const router = express_1.default.Router();
// Create a new reservation (requires user token)
router.post("/", tokenVerification_1.verifyToken, movieReservationController_1.createReservation);
// Get reservations for the logged-in user (requires user token)
router.get("/", tokenVerification_1.verifyToken, movieReservationController_1.getUserReservations);
// Get occupied seats for a showtime and date (public)
router.get("/occupied", movieReservationController_1.getOccupiedSeats);
// Get a single reservation by Mongo id or booking id (requires user token)
router.get("/:id", tokenVerification_1.verifyToken, movieReservationController_1.getReservationById);
// Cancel a reservation (requires user token)
router.patch("/:id/cancel", tokenVerification_1.verifyToken, movieReservationController_1.cancelReservation);
exports.default = router;
//# sourceMappingURL=movieReservationRoutes.js.map