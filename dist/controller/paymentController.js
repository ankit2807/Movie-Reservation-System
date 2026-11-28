"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleStripeWebhook = exports.createPaymentIntent = exports.getPaymentConfig = exports.getStripeClient = exports.isStripeConfigured = void 0;
const stripe_1 = __importDefault(require("stripe"));
const movieReservationModel_1 = __importDefault(require("../models/movieReservationModel"));
const pricing_1 = require("../utils/pricing");
let cachedStripeClient = null;
let cachedKey = null;
const isStripeConfigured = () => {
    const secret = String(process.env.STRIPE_SECRET_KEY || "").trim();
    const publishable = String(process.env.STRIPE_PUBLISHABLE_KEY || "").trim();
    return (secret.startsWith("sk_") &&
        !secret.includes("your_stripe") &&
        publishable.startsWith("pk_") &&
        !publishable.includes("your_stripe"));
};
exports.isStripeConfigured = isStripeConfigured;
const getStripeClient = () => {
    const secret = String(process.env.STRIPE_SECRET_KEY || "").trim();
    if (!secret || !secret.startsWith("sk_") || secret.includes("your_stripe")) {
        return null;
    }
    if (!cachedStripeClient || cachedKey !== secret) {
        cachedStripeClient = new stripe_1.default(secret, {
            appInfo: { name: "MovieBook Reservation System", version: "1.0.0" },
        });
        cachedKey = secret;
    }
    return cachedStripeClient;
};
exports.getStripeClient = getStripeClient;
/**
 * Public payment gateway configuration (never exposes secret keys).
 */
const getPaymentConfig = (_req, res) => {
    const stripeEnabled = (0, exports.isStripeConfigured)();
    const secret = String(process.env.STRIPE_SECRET_KEY || "").trim();
    const mode = !stripeEnabled ? "demo" : secret.startsWith("sk_live_") ? "live" : "test";
    return res.status(200).json({
        stripeEnabled,
        publishableKey: stripeEnabled ? String(process.env.STRIPE_PUBLISHABLE_KEY).trim() : null,
        currency: "inr",
        mode,
    });
};
exports.getPaymentConfig = getPaymentConfig;
/**
 * Create a Stripe PaymentIntent using strictly server-validated seat, F&B, and promo totals.
 */
const createPaymentIntent = async (req, res) => {
    try {
        const stripe = (0, exports.getStripeClient)();
        if (!stripe || !(0, exports.isStripeConfigured)()) {
            return res.status(503).json({
                message: "Stripe payment gateway is not configured on this server.",
            });
        }
        const body = req.body;
        const priced = (0, pricing_1.validateAndPriceShowKeyBooking)(body);
        if (priced.error !== undefined) {
            return res.status(400).json({ message: priced.error });
        }
        // Verify seats are still available before creating a PaymentIntent
        const conflict = await movieReservationModel_1.default.findOne({
            showKey: priced.cleanShowKey,
            status: { $ne: "CANCELLED" },
            seats: { $in: priced.uniqueSeats },
        });
        if (conflict) {
            const taken = conflict.seats.filter((s) => priced.uniqueSeats.includes(s));
            return res.status(409).json({
                message: `Seat${taken.length > 1 ? "s" : ""} ${taken.join(", ")} just got booked. Please choose different seats.`,
                takenSeats: taken,
            });
        }
        if (priced.amountInPaise < 5000) {
            return res.status(400).json({
                message: "Minimum payable amount for Stripe INR transactions is ₹50.",
            });
        }
        const receiptEmail = String(body.contact?.email || "").trim();
        const movieTitle = String(body.movieTitle || "MovieBook Ticket").slice(0, 120);
        const paymentIntent = await stripe.paymentIntents.create({
            amount: priced.amountInPaise,
            currency: "inr",
            automatic_payment_methods: { enabled: true },
            ...(receiptEmail ? { receipt_email: receiptEmail } : {}),
            description: `MovieBook: ${movieTitle} (${priced.uniqueSeats.join(", ")})`,
            metadata: {
                userId: String(req.user?.id || ""),
                showKey: priced.cleanShowKey,
                seats: priced.uniqueSeats.join(","),
                movieTitle,
                promoCode: priced.cleanPromo || "",
                expectedTotalInr: String(priced.amounts.total),
            },
        });
        return res.status(200).json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            amount: priced.amounts.total,
            amountInPaise: priced.amountInPaise,
            currency: "inr",
            amounts: priced.amounts,
        });
    }
    catch (err) {
        console.error("Create Stripe PaymentIntent error:", err);
        const stripeErr = err;
        return res.status(500).json({
            message: stripeErr.type === "StripeAuthenticationError"
                ? "Invalid Stripe API key configuration."
                : "Unable to initialize Stripe checkout. Please try again.",
        });
    }
};
exports.createPaymentIntent = createPaymentIntent;
/**
 * Stripe Webhook handler (mounted with express.raw BEFORE express.json).
 */
const handleStripeWebhook = async (req, res) => {
    const stripe = (0, exports.getStripeClient)();
    const webhookSecret = String(process.env.STRIPE_WEBHOOK_SECRET || "").trim();
    if (!stripe || !webhookSecret) {
        return res.status(400).json({ message: "Stripe webhook secret is not configured." });
    }
    const signature = req.headers["stripe-signature"];
    if (!signature || Array.isArray(signature)) {
        return res.status(400).json({ message: "Missing stripe-signature header." });
    }
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("Stripe webhook signature verification failed:", msg);
        return res.status(400).json({ message: "Webhook signature verification failed." });
    }
    try {
        switch (event.type) {
            case "payment_intent.succeeded": {
                const pi = event.data.object;
                await movieReservationModel_1.default.findOneAndUpdate({ paymentIntentId: pi.id }, { $set: { paymentStatus: "PAID" } });
                break;
            }
            case "payment_intent.payment_failed": {
                const pi = event.data.object;
                await movieReservationModel_1.default.findOneAndUpdate({ paymentIntentId: pi.id }, { $set: { paymentStatus: "FAILED" } });
                break;
            }
            case "charge.refunded": {
                const charge = event.data.object;
                if (charge.payment_intent) {
                    const isFullRefund = charge.amount_refunded >= charge.amount;
                    await movieReservationModel_1.default.findOneAndUpdate({ paymentIntentId: String(charge.payment_intent) }, { $set: { paymentStatus: isFullRefund ? "REFUNDED" : "PARTIALLY_REFUNDED" } });
                }
                break;
            }
            default:
                break;
        }
        return res.status(200).json({ received: true });
    }
    catch (err) {
        console.error("Stripe webhook processing error:", err);
        return res.status(500).json({ message: "Webhook handler error" });
    }
};
exports.handleStripeWebhook = handleStripeWebhook;
//# sourceMappingURL=paymentController.js.map