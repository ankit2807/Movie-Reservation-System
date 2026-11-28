"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminController_1 = require("../controller/adminController");
const rateLimiter_1 = require("../utils/rateLimiter");
const tokenVerification_1 = require("../utils/tokenVerification");
const router = express_1.default.Router();
// Creating additional admins requires an authenticated admin token
router.post("/register", rateLimiter_1.authLimiter, tokenVerification_1.verifyTokenAndAdmin, adminController_1.register);
router.post("/login", rateLimiter_1.authLimiter, adminController_1.login);
router.get("/stats", tokenVerification_1.verifyTokenAndAdmin, adminController_1.getDashboardStats);
exports.default = router;
//# sourceMappingURL=adminRoutes.js.map