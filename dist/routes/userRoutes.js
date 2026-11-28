"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controller/userController");
const tokenVerification_1 = require("../utils/tokenVerification");
const rateLimiter_1 = require("../utils/rateLimiter");
const router = express_1.default.Router();
router.post("/register", rateLimiter_1.authLimiter, userController_1.register);
router.post("/login", rateLimiter_1.authLimiter, userController_1.login);
router.post("/logout", userController_1.logout);
router.get("/session", userController_1.getSession);
router.get("/me", tokenVerification_1.verifyToken, userController_1.getMe);
router.put("/profile", tokenVerification_1.verifyToken, userController_1.updateProfile);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map