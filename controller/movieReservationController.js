const Reservation = require("../models/movieReservationModel");
const ShowTime = require("../models/showTimeModel");
const mongoose = require("mongoose");

const CONVENIENCE_FEE_PER_TICKET = 30; // base fee per ticket (₹)
const GST_RATE = 0.18; // GST on convenience fee
const CANCELLATION_CUTOFF_MS = 20 * 60 * 1000; // cancellations allowed until 20 min before show

const generateBookingId = () =>
  "MB" + Date.now().toString(36).toUpperCase().slice(-6) + Math.random().toString(36).slice(2, 5).toUpperCase();

const round2 = (n) => Math.round(n * 100) / 100;

const computePromoDiscount = (promoCode, ticketsAmount, foodAmount) => {
  const code = String(promoCode || "").trim().toUpperCase();
  if (code === "FIRSTSHOW") return Math.min(150, Math.round(ticketsAmount * 0.15));
  if (code === "PAYTM150") return ticketsAmount >= 300 ? 150 : 75;
  if (code === "RUPAY25") return Math.min(120, Math.round((ticketsAmount + foodAmount) * 0.2));
  return 0;
};

// Parse "10:15 AM" / "07:30 PM" / "19:30" + "YYYY-MM-DD" into a valid Date
const parseShowDateTime = (showDate, showTime, fallbackDateTime) => {
  if (fallbackDateTime) {
    const d = new Date(fallbackDateTime);
    if (!Number.isNaN(d.getTime())) return d;
  }
  const datePart = showDate || new Date().toISOString().split("T")[0];
  if (!showTime) return new Date(datePart);

  const match12 = String(showTime).trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const mins = parseInt(match12[2], 10);
    const period = match12[3].toUpperCase();
    if (period === "PM" && hours < 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    const hh = String(hours).padStart(2, "0");
    const mm = String(mins).padStart(2, "0");
    const d = new Date(`${datePart}T${hh}:${mm}:00`);
    if (!Number.isNaN(d.getTime())) return d;
  }

  const match24 = String(showTime).trim().match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const hh = String(match24[1]).padStart(2, "0");
    const mm = String(match24[2]).padStart(2, "0");
    const d = new Date(`${datePart}T${hh}:${mm}:00`);
    if (!Number.isNaN(d.getTime())) return d;
  }

  const fallback = new Date(datePart);
  return Number.isNaN(fallback.getTime()) ? new Date() : fallback;
};

/**
 * Create a booking for a cinema show identified by `showKey`.
 * Stores a full snapshot of the show so it can be rendered without external lookups.
 */
const createShowKeyReservation = async (req, res) => {
  const {
    showKey, movie, movieTitle, posterImage, certification, language, format,
    theatre, showDate, showTime, showDateTime, seatDetails, food, promoCode, paymentMethod, contact,
  } = req.body;

  const seatLines = Array.isArray(seatDetails) ? seatDetails : [];
  const seatsArray = seatLines.map((s) => String(s.seat || "").toUpperCase());

  if (!seatsArray.length || seatsArray.length > 10) {
    return res.status(400).json({ message: "Select between 1 and 10 seats" });
  }
  if (!showDate || !showTime || !theatre?.name) {
    return res.status(400).json({ message: "Show details are incomplete" });
  }

  const showAt = parseShowDateTime(showDate, showTime, showDateTime);

  // Seat conflict check (cancelled bookings free their seats)
  const conflict = await Reservation.findOne({
    showKey,
    status: { $ne: "CANCELLED" },
    seats: { $in: seatsArray },
  });
  if (conflict) {
    const taken = conflict.seats.filter((s) => seatsArray.includes(s));
    return res.status(409).json({
      message: `Seat${taken.length > 1 ? "s" : ""} ${taken.join(", ")} just got booked. Please choose different seats.`,
      takenSeats: taken,
    });
  }

  // Recompute amounts server-side from line items
  const foodLines = (Array.isArray(food) ? food : [])
    .filter((f) => f && Number(f.qty) > 0)
    .map((f) => ({ id: String(f.id), name: String(f.name), qty: Number(f.qty), price: Number(f.price) || 0 }));
  const ticketsAmount = seatLines.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
  const convenienceFee = CONVENIENCE_FEE_PER_TICKET * seatsArray.length;
  const gst = round2(convenienceFee * GST_RATE);
  const foodAmount = foodLines.reduce((sum, f) => sum + f.qty * f.price, 0);
  const cleanPromo = promoCode ? String(promoCode).trim().toUpperCase() : undefined;
  const discount = computePromoDiscount(cleanPromo, ticketsAmount, foodAmount);
  const total = Math.max(0, round2(ticketsAmount + convenienceFee + gst + foodAmount - discount));

  const isMovieMongoId = typeof movie === "string" && /^[0-9a-fA-F]{24}$/.test(movie);

  const reservation = new Reservation({
    user: req.user.id,
    movie: isMovieMongoId ? movie : undefined,
    showKey,
    bookingId: generateBookingId(),
    movieRef: movie ? String(movie) : undefined,
    movieTitle,
    posterImage,
    certification,
    language,
    format,
    theatre: {
      id: theatre.id,
      name: theatre.name,
      address: theatre.address,
      screen: theatre.screen,
    },
    showDate,
    showTime,
    showDateTime: showAt,
    seats: seatsArray,
    seatDetails: seatLines.map((s) => ({ seat: String(s.seat).toUpperCase(), tier: s.tier, price: Number(s.price) || 0 })),
    food: foodLines,
    amounts: { tickets: ticketsAmount, convenienceFee, gst, food: foodAmount, discount, total },
    promoCode: discount > 0 ? cleanPromo : undefined,
    paymentMethod,
    contact,
    date: showAt,
  });

  const saved = await reservation.save();
  return res.status(201).json({ ...saved.toObject(), message: "Booking confirmed!" });
};

/**
 * Create a new reservation.
 */
const createReservation = async (req, res) => {
  try {
    if (req.body.showKey) {
      return await createShowKeyReservation(req, res);
    }

    const { movie, showtime, seats, date } = req.body;
    const userId = req.user.id;

    const seatsArray = Array.isArray(seats)
      ? seats
      : typeof seats === "string"
      ? seats.split(",").map((s) => s.replace(/'/g, "").trim().toUpperCase()).filter(Boolean)
      : [];

    if (!userId || !showtime || !seatsArray.length || !date) {
      return res.status(400).json({
        message: "Showtime, seats, and date are required",
      });
    }

    const reservationDate = new Date(date);
    if (Number.isNaN(reservationDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    let existingShowtime = null;
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(showtime);

    if (isMongoId) {
      existingShowtime = await ShowTime.findById(showtime);
    }

    if (!existingShowtime && movie) {
      const isMovieMongoId = /^[0-9a-fA-F]{24}$/.test(movie);
      if (isMovieMongoId) {
        existingShowtime = await ShowTime.findOne({
          movieId: movie,
          startAt: showtime,
        });
      }
    }

    if (!existingShowtime) {
      const bookingId = generateBookingId();
      const flexReservation = new Reservation({
        user: userId,
        bookingId,
        movie: /^[0-9a-fA-F]{24}$/.test(String(movie || "")) ? movie : undefined,
        showtime: isMongoId ? showtime : undefined,
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
  } catch (err) {
    console.error("Create reservation error:", err);
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get reservations for the logged-in user.
 */
const getUserReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ user: req.user.id })
      .populate("movie")
      .populate("showtime")
      .sort({ createdAt: -1 });
    return res.status(200).json(reservations);
  } catch (err) {
    console.error("Get user reservations error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get occupied seats for a specific showtime and date.
 */
const getOccupiedSeats = async (req, res) => {
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

    const reservationDate = new Date(date);
    if (Number.isNaN(reservationDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    const startOfDay = new Date(reservationDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(reservationDate);
    endOfDay.setHours(23, 59, 59, 999);

    const reservations = await Reservation.find({
      showtime: showtimeId,
      status: { $ne: "CANCELLED" },
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    }).select("seats");

    return res.status(200).json(reservations.flatMap((r) => r.seats));
  } catch (err) {
    console.error("Get occupied seats error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get a single reservation owned by the logged-in user.
 */
const getReservationById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = /^[0-9a-fA-F]{24}$/.test(id) ? { _id: id } : { bookingId: id };
    const reservation = await Reservation.findOne({ ...query, user: req.user.id })
      .populate("movie")
      .populate("showtime");
    if (!reservation) {
      return res.status(404).json({ message: "Booking not found" });
    }
    return res.status(200).json(reservation);
  } catch (err) {
    console.error("Get reservation error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Cancel a reservation owned by the logged-in user.
 * Allowed until 20 minutes before the show. Ticket + F&B (less promo discount) is refunded;
 * convenience fees are non-refundable.
 */
const cancelReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const query = /^[0-9a-fA-F]{24}$/.test(id) ? { _id: id } : { bookingId: id };
    const reservation = await Reservation.findOne({ ...query, user: req.user.id });
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

    const amounts = reservation.amounts || {};
    const fallbackTicketRefund = (reservation.seats?.length || 1) * 250;
    reservation.status = "CANCELLED";
    reservation.cancelledAt = new Date();
    reservation.refundAmount = Math.max(
      0,
      round2(
        amounts.tickets
          ? (amounts.tickets || 0) + (amounts.food || 0) - (amounts.discount || 0)
          : fallbackTicketRefund
      )
    );
    await reservation.save();

    return res.status(200).json({
      ...reservation.toObject(),
      message: "Booking cancelled. Refund will be processed in 5-7 working days.",
    });
  } catch (err) {
    console.error("Cancel reservation error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createReservation,
  getUserReservations,
  getOccupiedSeats,
  getReservationById,
  cancelReservation,
};
