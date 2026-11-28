const Stripe = require("stripe");
const Reservation = require("../models/movieReservationModel");
const { validateAndPriceShowKeyBooking } = require("../utils/pricing");

let cachedStripeClient = null;
let cachedKey = null;

const isStripeConfigured = () => {
  const secret = String(process.env.STRIPE_SECRET_KEY || "").trim();
  const publishable = String(process.env.STRIPE_PUBLISHABLE_KEY || "").trim();
  return (
    secret.startsWith("sk_") &&
    !secret.includes("your_stripe") &&
    publishable.startsWith("pk_") &&
    !publishable.includes("your_stripe")
  );
};

const getStripeClient = () => {
  const secret = String(process.env.STRIPE_SECRET_KEY || "").trim();
  if (!secret || !secret.startsWith("sk_") || secret.includes("your_stripe")) {
    return null;
  }
  if (!cachedStripeClient || cachedKey !== secret) {
    cachedStripeClient = new Stripe(secret, {
      appInfo: { name: "MovieBook Reservation System", version: "1.0.0" },
    });
    cachedKey = secret;
  }
  return cachedStripeClient;
};

/**
 * Public payment gateway configuration (never exposes secret keys).
 */
const getPaymentConfig = (_req, res) => {
  const stripeEnabled = isStripeConfigured();
  const secret = String(process.env.STRIPE_SECRET_KEY || "").trim();
  const mode = !stripeEnabled ? "demo" : secret.startsWith("sk_live_") ? "live" : "test";

  return res.status(200).json({
    stripeEnabled,
    publishableKey: stripeEnabled ? String(process.env.STRIPE_PUBLISHABLE_KEY).trim() : null,
    currency: "inr",
    mode,
  });
};

/**
 * Create a Stripe PaymentIntent using strictly server-validated seat, F&B, and promo totals.
 */
const createPaymentIntent = async (req, res) => {
  try {
    const stripe = getStripeClient();
    if (!stripe || !isStripeConfigured()) {
      return res.status(503).json({
        message: "Stripe payment gateway is not configured on this server.",
      });
    }

    const priced = validateAndPriceShowKeyBooking(req.body);
    if (priced.error) {
      return res.status(400).json({ message: priced.error });
    }

    // Verify seats are still available before creating a PaymentIntent
    const conflict = await Reservation.findOne({
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

    const receiptEmail = String(req.body.contact?.email || "").trim();
    const movieTitle = String(req.body.movieTitle || "MovieBook Ticket").slice(0, 120);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: priced.amountInPaise,
      currency: "inr",
      automatic_payment_methods: { enabled: true },
      ...(receiptEmail ? { receipt_email: receiptEmail } : {}),
      description: `MovieBook: ${movieTitle} (${priced.uniqueSeats.join(", ")})`,
      metadata: {
        userId: String(req.user.id),
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
  } catch (err) {
    console.error("Create Stripe PaymentIntent error:", err);
    return res.status(500).json({
      message: err.type === "StripeAuthenticationError"
        ? "Invalid Stripe API key configuration."
        : "Unable to initialize Stripe checkout. Please try again.",
    });
  }
};

/**
 * Stripe Webhook handler (mounted with express.raw BEFORE express.json).
 */
const handleStripeWebhook = async (req, res) => {
  const stripe = getStripeClient();
  const webhookSecret = String(process.env.STRIPE_WEBHOOK_SECRET || "").trim();

  if (!stripe || !webhookSecret) {
    return res.status(400).json({ message: "Stripe webhook secret is not configured." });
  }

  const signature = req.headers["stripe-signature"];
  if (!signature) {
    return res.status(400).json({ message: "Missing stripe-signature header." });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err.message);
    return res.status(400).json({ message: "Webhook signature verification failed." });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const pi = event.data.object;
        await Reservation.findOneAndUpdate(
          { paymentIntentId: pi.id },
          { $set: { paymentStatus: "PAID" } }
        );
        break;
      }
      case "payment_intent.payment_failed": {
        const pi = event.data.object;
        await Reservation.findOneAndUpdate(
          { paymentIntentId: pi.id },
          { $set: { paymentStatus: "FAILED" } }
        );
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object;
        if (charge.payment_intent) {
          const isFullRefund = charge.amount_refunded >= charge.amount;
          await Reservation.findOneAndUpdate(
            { paymentIntentId: String(charge.payment_intent) },
            { $set: { paymentStatus: isFullRefund ? "REFUNDED" : "PARTIALLY_REFUNDED" } }
          );
        }
        break;
      }
      default:
        break;
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("Stripe webhook processing error:", err);
    return res.status(500).json({ message: "Webhook handler error" });
  }
};

module.exports = {
  isStripeConfigured,
  getStripeClient,
  getPaymentConfig,
  createPaymentIntent,
  handleStripeWebhook,
};
