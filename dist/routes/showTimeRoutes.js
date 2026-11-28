"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const showTimeController_1 = require("../controller/showTimeController");
const tokenVerification_1 = require("../utils/tokenVerification");
const router = express_1.default.Router();
// Add a new showtime (requires admin token)
router.post("/", tokenVerification_1.verifyTokenAndAdmin, showTimeController_1.addShowTime);
// Update a showtime by ID (requires admin token)
router.put("/:id", tokenVerification_1.verifyTokenAndAdmin, showTimeController_1.updateShowTimeById);
// Delete a showtime by ID (requires admin token)
router.delete("/:id", tokenVerification_1.verifyTokenAndAdmin, showTimeController_1.deleteShowTime);
// Get a showtime by ID (public)
router.get("/find/:id", showTimeController_1.getShowTimeById);
// Get all showtimes (public)
router.get("/", showTimeController_1.getShowTimes);
exports.default = router;
//# sourceMappingURL=showTimeRoutes.js.map