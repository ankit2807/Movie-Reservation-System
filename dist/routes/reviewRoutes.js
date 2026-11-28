"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const reviewController_1 = require("../controller/reviewController");
const tokenVerification_1 = require("../utils/tokenVerification");
const router = express_1.default.Router();
router.post("/", tokenVerification_1.verifyToken, reviewController_1.addReview);
router.get("/:movieId", reviewController_1.getMovieReviews);
exports.default = router;
//# sourceMappingURL=reviewRoutes.js.map