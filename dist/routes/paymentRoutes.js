"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const paymentController_1 = require("../controller/paymentController");
const tokenVerification_1 = require("../utils/tokenVerification");
const router = express_1.default.Router();
// Public publishable config (safe for frontend)
router.get("/config", paymentController_1.getPaymentConfig);
// Create server-priced Stripe PaymentIntent for checkout (requires authenticated user)
router.post("/create-payment-intent", tokenVerification_1.verifyToken, paymentController_1.createPaymentIntent);
exports.default = router;
//# sourceMappingURL=paymentRoutes.js.map