"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const movieController_1 = require("../controller/movieController");
const tokenVerification_1 = require("../utils/tokenVerification");
const router = express_1.default.Router();
// Search movies (public) — must be before /:id routes
router.get("/search", movieController_1.searchMovies);
// Add a new movie (requires admin token)
router.post("/", tokenVerification_1.verifyTokenAndAdmin, movieController_1.addMovie);
// Update a movie by ID (requires admin token)
router.patch("/:id", tokenVerification_1.verifyTokenAndAdmin, movieController_1.updateMovie);
// Delete a movie by ID (requires admin token)
router.delete("/:id", tokenVerification_1.verifyTokenAndAdmin, movieController_1.deleteMovie);
// Get a movie by ID (public)
router.get("/find/:id", movieController_1.getMovieById);
// Get all movies (public)
router.get("/", movieController_1.getMovies);
exports.default = router;
//# sourceMappingURL=movieRoutes.js.map