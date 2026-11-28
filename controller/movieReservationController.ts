import type { Request, Response } from "express";
import type Stripe from "stripe";
import Reservation, {
  PaymentProvider,
  PaymentStatus,
} from "../models/movieReservationModel";
import ShowTime, { IShowTime } from "../models/showTimeModel";
import {
  CANCELLATION_CUTOFF_MS,
  round2,
  ShowKeyPricingInput,
  validateAndPriceShowKeyBooking,
} from "../utils/pricing";
import { isStripeConfigured, getStripeClient } from "./paymentController";

const generateBookingId = (): string =>
  "MB" +
  Date.now().toString(36).toUpperCase().slice(-6) +
  Math.random().toString(36).slice(2, 5).toUpperCase();

interface ShowKeyReservationBody extends ShowKeyPricingInput {
  movie?: unknown;
  movieTitle?: unknown;
  posterImage?: unknown;
  certification?: unknown;
  language?: unknown;
  format?: unknown;
  paymentMethod?: unknown;
  paymentIntentId?: unknown;
  contact?: { email?: unknown; phone?: unknown };
}

/**
 * Create a booking for a cinema show identified by `showKey`.
 * Strictly computes seat & food prices from authoritative server catalogs,
 * verifies Stripe PaymentIntent when Stripe is active, and auto-refunds on seat-race conflicts.
 */
const createShowKeyReservation = async (req: Request, res: Response): Promise<Response> => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: "You are not authenticated!" });
  }

  const body = req.body as ShowKeyReservationBody;
  const {
    movie,
    movieTitle,
    posterImage,
    certification,
    language,
    format,
    theatre,
    showDate,
    showTime,
    paymentMethod,
    paymentIntentId,
    contact,
  } = body;

  const priced = validateAndPriceShowKeyBooking(body);
  if (priced.error !== undefined) {
    return res.status(400).json({ message: priced.error });
  }

  const stripeActive = isStripeConfigured();
  const cleanPaymentIntentId = paymentIntentId ? String(paymentIntentId).trim() : "";

  let resolvedPaymentProvider: PaymentProvider = "DEMO";
  let resolvedPaymentStatus: PaymentStatus = "PAID";
  let resolvedPaymentMethod = String(paymentMethod || "UPI").slice(0, 30);

  if (stripeActive || cleanPaymentIntentId) {
    const stripe = getStripeClient();
    if (!stripe) {
      return res.status(503).json({ message: "Stripe gateway is unavailable." });
    }
    if (!cleanPaymentIntentId) {
      return res.status(402).json({
        message: "Payment verification required. Complete Stripe checkout before confirming.",
      });
    }

    // Idempotency: return existing booking if this PaymentIntent was already confirmed
    const existingForIntent = await Reservation.findOne({
      paymentIntentId: cleanPaymentIntentId,
      user: userId,
    });
    if (existingForIntent) {
      return res.status(200).json({
        ...existingForIntent.toObject(),
        message: "Booking already confirmed!",
      });
    }

    let intent: Stripe.PaymentIntent;
    try {
      intent = await stripe.paymentIntents.retrieve(cleanPaymentIntentId);
    } catch {
      return res.status(400).json({ message: "Invalid Stripe payment reference." });
    }

    if (intent.status !== "succeeded") {
      return res.status(402).json({
        message: `Payment not completed (status: ${intent.status}). Please finish checkout.`,
      });
    }
    if (intent.metadata?.userId !== String(userId)) {
      return res.status(403).json({ message: "Payment does not belong to the signed-in user." });
    }
    if (intent.metadata?.showKey !== priced.cleanShowKey) {
      return res.status(400).json({ message: "Payment showtime mismatch." });
    }
    if (intent.amount !== priced.amountInPaise) {
      return res.status(400).json({
        message: "Payment amount mismatch. Please refresh checkout and try again.",
      });
    }

    resolvedPaymentProvider = "STRIPE";
    resolvedPaymentStatus = "PAID";
    resolvedPaymentMethod = "STRIPE";
  }

  // Pre-check seat conflict
  const conflict = await Reservation.findOne({
    showKey: priced.cleanShowKey,
    status: { $ne: "CANCELLED" },
    seats: { $in: priced.uniqueSeats },
  });
  if (conflict) {
    const taken = conflict.seats.filter((s) => priced.uniqueSeats.includes(s));
    let autoRefundNote = "";
    if (resolvedPaymentProvider === "STRIPE" && cleanPaymentIntentId) {
      try {
        const stripe = getStripeClient();
        if (stripe) {
          await stripe.refunds.create({
            payment_intent: cleanPaymentIntentId,
            reason: "requested_by_customer",
          });
          autoRefundNote = " Your Stripe payment has been automatically refunded in full.";
        }
      } catch (refundErr: unknown) {
        const msg = refundErr instanceof Error ? refundErr.message : String(refundErr);
        console.error("Auto-refund failed after seat conflict:", msg);
      }
    }
    return res.status(409).json({
      message: `Seat${taken.length > 1 ? "s" : ""} ${taken.join(", ")} just got booked. Please choose different seats.${autoRefundNote}`,
      takenSeats: taken,
    });
  }

  const isMovieMongoId = typeof movie === "string" && /^[0-9a-fA-F]{24}$/.test(movie);

  const reservation = new Reservation({
    user: userId,
    movie: isMovieMongoId ? movie : undefined,
    showKey: priced.cleanShowKey,
    bookingId: generateBookingId(),
    movieRef: movie ? String(movie).slice(0, 80) : undefined,
    movieTitle: String(movieTitle || "").slice(0, 150),
    posterImage: String(posterImage || "").slice(0, 500),
    certification: String(certification || "UA").slice(0, 16),
    language: String(language || "English").slice(0, 40),
    format: String(format || "2D").slice(0, 60),
    theatre: {
      id: String(theatre?.id || "").slice(0, 80),
      name: String(theatre?.name || "").slice(0, 160),
      address: String(theatre?.address || "").slice(0, 240),
      screen: String(theatre?.screen || "AUDI 01").slice(0, 40),
    },
    showDate: String(showDate).slice(0, 20),
    showTime: String(showTime).slice(0, 20),
    showDateTime: priced.showAt,
    seats: priced.uniqueSeats,
    seatDetails: priced.verifiedSeatDetails,
    food: priced.verifiedFoodLines,
    amounts: priced.amounts,
    promoCode: priced.cleanPromo,
    paymentMethod: resolvedPaymentMethod,
    paymentProvider: resolvedPaymentProvider,
    paymentStatus: resolvedPaymentStatus,
    paymentIntentId: cleanPaymentIntentId || undefined,
    contact: {
      email: String(contact?.email || "").trim().slice(0, 120),
      phone: String(contact?.phone || "").trim().slice(0, 20),
    },
    date: priced.showAt,
  });

  try {
    const saved = await reservation.save();
    return res.status(201).json({ ...saved.toObject(), message: "Booking confirmed!" });
  } catch (saveErr: unknown) {
    const errObj = saveErr as { code?: number };
    // Handle concurrent race condition where unique multikey index rejected duplicate seat
    if (errObj.code === 11000 && resolvedPaymentProvider === "STRIPE" && cleanPaymentIntentId) {
      try {
        const stripe = getStripeClient();
        if (stripe) {
          await stripe.refunds.create({
            payment_intent: cleanPaymentIntentId,
            reason: "requested_by_customer",
          });
        }
      } catch (refundErr: unknown) {
        const msg = refundErr instanceof Error ? refundErr.message : String(refundErr);
        console.error("Race-condition Stripe auto-refund error:", msg);
      }
      return res.status(409).json({
        message:
          "One or more selected seats were just booked by another user. Your Stripe payment has been automatically refunded.",
      });
    }
    throw saveErr;
  }
};

/**
 * Create a new reservation.
 */
export const createReservation = async (req: Request, res: Response): Promise<Response> => {
  try {
    if (req.body?.showKey) {
      return await createShowKeyReservation(req, res);
    }

    const { movie, showtime, seats, date } = req.body as {
      movie?: unknown;
      showtime?: unknown;
      seats?: unknown;
      date?: unknown;
    };
    const userId = req.user?.id;

    const rawSeats: string[] = Array.isArray(seats)
      ? seats.map((s) => String(s).trim().toUpperCase()).filter(Boolean)
      : typeof seats === "string"
        ? seats
            .split(",")
            .map((s) => s.replace(/'/g, "").trim().toUpperCase())
            .filter(Boolean)
        : [];
    const seatsArray = [...new Set(rawSeats)];

    if (!userId || !showtime || !seatsArray.length || seatsArray.length > 10 || !date) {
      return res.status(400).json({
        message: "Showtime, 1–10 seats, and date are required",
      });
    }

    const reservationDate = new Date(String(date));
    if (Number.isNaN(reservationDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    let existingShowtime: IShowTime | null = null;
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(String(showtime));

    if (isMongoId) {
      existingShowtime = await ShowTime.findById(String(showtime));
    }

    if (!existingShowtime && movie) {
      const isMovieMongoId = /^[0-9a-fA-F]{24}$/.test(String(movie));
      if (isMovieMongoId) {
        existingShowtime = await ShowTime.findOne({
          movieId: String(movie),
          startAt: String(showtime),
        });
      }
    }

    if (!existingShowtime) {
      const bookingId = generateBookingId();
      const flexReservation = new Reservation({
        user: userId,
        bookingId,
        movie: /^[0-9a-fA-F]{24}$/.test(String(movie || "")) ? String(movie) : undefined,
        showtime: isMongoId ? String(showtime) : undefined,
        seats: seatsArray,
        date: reservationDate,
      });

      const saved = await flexReservation.save();
      return res.status(201).json({
        ...saved.toObject(),
        bookingId,
        message: "Booking confirmed!",
      });
    }

    if (
      reservationDate < existingShowtime.startDate ||
      reservationDate > existingShowtime.endDate
    ) {
      return res.status(400).json({
        message: "Date is outside the available showtime range",
      });
    }

    const conflictingReservations = await Reservation.find({
      showtime: existingShowtime._id,
      status: { $ne: "CANCELLED" },
      date: reservationDate,
      seats: { $in: seatsArray },
    });

    if (conflictingReservations.length > 0) {
      return res.status(409).json({
        message: "Some seats are already reserved for this date and time",
      });
    }

    const bookingId = generateBookingId();
    const newReservation = new Reservation({
      user: userId,
      bookingId,
      movie: existingShowtime.movieId,
      showtime: existingShowtime._id,
      seats: seatsArray,
      date: reservationDate,
    });

    const savedReservation = await newReservation.save();
    return res.status(201).json({
      ...savedReservation.toObject(),
      bookingId,
      message: "Booking confirmed!",
    });
  } catch (err: unknown) {
    const e = err as { code?: number; name?: string; message?: string };
    if (e.code === 11000) {
      return res.status(409).json({
        message:
          "One or more selected seats were just booked by another user. Please choose different seats.",
      });
    }
    console.error("Create reservation error:", err);
    if (e.name === "ValidationError") {
      return res.status(400).json({ message: e.message || "Validation error" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get reservations for the logged-in user.
 */
export const getUserReservations = async (req: Request, res: Response): Promise<Response> => {
  try {
    const reservations = await Reservation.find({ user: req.user?.id })
      .populate("movie")
      .populate("showtime")
      .sort({ createdAt: -1 });
    return res.status(200).json(reservations);
  } catch (err: unknown) {
    console.error("Get user reservations error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get occupied seats for a specific showtime and date.
 */
export const getOccupiedSeats = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { showtimeId, date, showKey } = req.query;

    if (showKey) {
      const reservations = await Reservation.find({
        showKey: String(showKey),
        status: { $ne: "CANCELLED" },
      }).select("seats");
      return res.status(200).json(reservations.flatMap((r) => r.seats));
    }

    if (!showtimeId || !date) {
      return res.status(400).json({ message: "showtimeId and date are required" });
    }

    if (!/^[0-9a-fA-F]{24}$/.test(String(showtimeId))) {
      const reservations = await Reservation.find({
        showKey: String(showtimeId),
        status: { $ne: "CANCELLED" },
      }).select("seats");
      return res.status(200).json(reservations.flatMap((r) => r.seats));
    }

    const reservationDate = new Date(String(date));
    if (Number.isNaN(reservationDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    const startOfDay = new Date(reservationDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(reservationDate);
    endOfDay.setHours(23, 59, 59, 999);

    const reservations = await Reservation.find({
      showtime: String(showtimeId),
      status: { $ne: "CANCELLED" },
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    }).select("seats");

    return res.status(200).json(reservations.flatMap((r) => r.seats));
  } catch (err: unknown) {
    console.error("Get occupied seats error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get a single reservation owned by the logged-in user.
 */
export const getReservationById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const id = String(req.params.id || "");
    const query = /^[0-9a-fA-F]{24}$/.test(id) ? { _id: id } : { bookingId: id };
    const reservation = await Reservation.findOne({ ...query, user: req.user?.id })
      .populate("movie")
      .populate("showtime");
    if (!reservation) {
      return res.status(404).json({ message: "Booking not found" });
    }
    return res.status(200).json(reservation);
  } catch (err: unknown) {
    console.error("Get reservation error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Cancel a reservation owned by the logged-in user (automatically triggers Stripe refund if paid via Stripe).
 */
export const cancelReservation = async (req: Request, res: Response): Promise<Response> => {
  try {
    const id = String(req.params.id || "");
    const query = /^[0-9a-fA-F]{24}$/.test(id) ? { _id: id } : { bookingId: id };
    const reservation = await Reservation.findOne({ ...query, user: req.user?.id });
    if (!reservation) {
      return res.status(404).json({ message: "Booking not found" });
    }
    if (reservation.status === "CANCELLED") {
      return res.status(400).json({ message: "Booking is already cancelled" });
    }

    if (reservation.showDateTime) {
      const showMs = new Date(reservation.showDateTime).getTime();
      if (!Number.isNaN(showMs) && showMs - Date.now() < CANCELLATION_CUTOFF_MS) {
        return res.status(400).json({
          message: "Cancellations are only permitted up to 20 minutes before showtime.",
        });
      }
    }

    const amounts = reservation.amounts;
    const fallbackTicketRefund = (reservation.seats?.length || 1) * 250;
    const refundAmount = Math.max(
      0,
      round2(
        amounts?.tickets
          ? (amounts.tickets || 0) + (amounts.food || 0) - (amounts.discount || 0)
          : fallbackTicketRefund
      )
    );

    if (
      reservation.paymentProvider === "STRIPE" &&
      reservation.paymentIntentId &&
      refundAmount > 0
    ) {
      const stripe = getStripeClient();
      if (stripe) {
        try {
          const refund = await stripe.refunds.create({
            payment_intent: reservation.paymentIntentId,
            amount: Math.round(refundAmount * 100),
            reason: "requested_by_customer",
          });
          reservation.stripeRefundId = refund.id;
          reservation.paymentStatus =
            amounts?.total && refundAmount >= amounts.total ? "REFUNDED" : "PARTIALLY_REFUNDED";
        } catch (stripeErr: unknown) {
          const msg = stripeErr instanceof Error ? stripeErr.message : String(stripeErr);
          console.error("Stripe cancellation refund error:", msg);
          return res.status(502).json({
            message: "Unable to initiate Stripe refund right now. Please retry shortly.",
          });
        }
      }
    }

    reservation.status = "CANCELLED";
    reservation.cancelledAt = new Date();
    reservation.refundAmount = refundAmount;
    await reservation.save();

    return res.status(200).json({
      ...reservation.toObject(),
      message: reservation.stripeRefundId
        ? `Booking cancelled. Stripe refund (${reservation.stripeRefundId}) initiated for ₹${refundAmount}.`
        : "Booking cancelled. Refund will be processed in 5-7 working days.",
    });
  } catch (err: unknown) {
    console.error("Cancel reservation error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
