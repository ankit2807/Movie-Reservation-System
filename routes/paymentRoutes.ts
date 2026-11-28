import express from "express";
import { getPaymentConfig, createPaymentIntent } from "../controller/paymentController";
import { verifyToken } from "../utils/tokenVerification";

const router = express.Router();

// Public publishable config (safe for frontend)
router.get("/config", getPaymentConfig);

// Create server-priced Stripe PaymentIntent for checkout (requires authenticated user)
router.post("/create-payment-intent", verifyToken, createPaymentIntent);

export default router;
