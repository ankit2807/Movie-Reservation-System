const router = require("express").Router();
const { getPaymentConfig, createPaymentIntent } = require("../controller/paymentController");
const { verifyToken } = require("../utils/tokenVerification");

// Public publishable config (safe for frontend)
router.get("/config", getPaymentConfig);

// Create server-priced Stripe PaymentIntent for checkout (requires authenticated user)
router.post("/create-payment-intent", verifyToken, createPaymentIntent);

module.exports = router;
