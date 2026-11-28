import type { CookieOptions, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";
import Admin from "../models/adminModel";
import Movie from "../models/movieModel";
import User from "../models/userModel";
import ShowTime from "../models/showTimeModel";
import Reservation from "../models/movieReservationModel";

interface PopulatedBookingRow {
  _id: unknown;
  bookingId?: string;
  status?: string;
  user?: { name?: string; email?: string; phone?: string } | null;
  movie?: { title?: string } | null;
  contact?: { email?: string; phone?: string };
  movieTitle?: string;
  theatre?: { name?: string };
  showDate?: string;
  showTime?: string;
  date?: Date;
  seats?: string[];
  amounts?: { total?: number };
  createdAt?: Date;
}

interface ReservationAggRow {
  _id: string | null;
  count: number;
  revenue?: number;
  seatsCount?: number;
}

const getCookieOptions = (maxAgeMs: number): CookieOptions => {
  const isProd = process.env.NODE_ENV === "production";
  const isSecure = process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === "true" : isProd;
  const crossOrigin = isSecure && process.env.CROSS_ORIGIN_AUTH === "true";
  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: crossOrigin ? "none" : "lax",
    maxAge: maxAgeMs,
  };
};

/**
 * Register a new admin (requires existing authenticated admin).
 */
export const register = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { name, email, password } = req.body as {
      name?: unknown;
      email?: unknown;
      password?: unknown;
    };

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    if (!validator.isEmail(cleanEmail)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const cleanPassword = String(password);
    if (cleanPassword.length < 7) {
      return res.status(400).json({ message: "Password must be at least 7 characters long" });
    }

    const existingAdmin = await Admin.findOne({ email: cleanEmail });
    if (existingAdmin) {
      return res.status(409).json({ message: "Admin already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(cleanPassword, salt);

    const newAdmin = new Admin({
      name: String(name || "Admin").trim(),
      email: cleanEmail,
      password: hashedPassword,
    });

    await newAdmin.save();
    return res.status(201).json({ message: "Admin created successfully" });
  } catch (err: unknown) {
    console.error("Admin registration error:", err);
    const e = err as { name?: string; message?: string };
    if (e.name === "ValidationError") {
      return res.status(400).json({ message: e.message || "Validation error" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Login an admin.
 */
export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password } = req.body as { email?: unknown; password?: unknown };

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const admin = await Admin.findOne({ email: cleanEmail });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const validated = await bcrypt.compare(String(password), admin.password);
    if (!validated) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: "JWT secret not configured" });
    }

    const token = jwt.sign(
      { id: String(admin._id), isAdmin: true },
      secret,
      { algorithm: "HS256", expiresIn: "4h" }
    );

    return res
      .cookie("access_token", token, getCookieOptions(4 * 60 * 60 * 1000))
      .status(200)
      .json({
        _id: String(admin._id),
        email: admin.email,
        name: admin.name,
        isAdmin: true,
        role: "admin",
      });
  } catch (err: unknown) {
    console.error("Admin login error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Real-time Admin Dashboard KPIs, revenue, category breakdown, and recent bookings.
 */
export const getDashboardStats = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const [movies, totalUsers, totalShowtimes, reservations] = await Promise.all([
      Movie.find({}, "title type rating").lean(),
      User.countDocuments(),
      ShowTime.countDocuments(),
      Reservation.find({})
        .populate("user", "name email phone")
        .populate("movie", "title")
        .sort({ createdAt: -1 })
        .limit(50)
        .lean<PopulatedBookingRow[]>(),
    ]);

    const categoryBreakdown: Record<string, number> = {};
    for (const m of movies) {
      const cat = m.type || "Movie";
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
    }

    let confirmedBookings = 0;
    let cancelledBookings = 0;
    let totalRevenue = 0;
    let totalSeatsSold = 0;

    const allReservationsAgg = await Reservation.aggregate<ReservationAggRow>([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          revenue: {
            $sum: {
              $ifNull: [
                "$amounts.total",
                { $multiply: [{ $size: { $ifNull: ["$seats", []] } }, 290] },
              ],
            },
          },
          seatsCount: { $sum: { $size: { $ifNull: ["$seats", []] } } },
        },
      },
    ]);

    for (const row of allReservationsAgg) {
      if (row._id === "CANCELLED") {
        cancelledBookings += row.count;
      } else {
        confirmedBookings += row.count;
        totalRevenue += row.revenue || 0;
        totalSeatsSold += row.seatsCount || 0;
      }
    }

    const recentBookings = reservations.slice(0, 15).map((r) => ({
      _id: String(r._id),
      bookingId: r.bookingId || String(r._id).slice(-8).toUpperCase(),
      status: r.status || "CONFIRMED",
      customerName: r.user?.name || r.contact?.email || "Guest",
      customerEmail: r.user?.email || r.contact?.email || "",
      movieTitle: r.movieTitle || r.movie?.title || "Movie",
      theatreName: r.theatre?.name || "PVR: Logix City Centre Mall, Noida",
      showDate: r.showDate || (r.date ? new Date(r.date).toISOString().split("T")[0] : ""),
      showTime: r.showTime || "07:30 PM",
      seats: r.seats || [],
      total: r.amounts?.total || (r.seats?.length || 1) * 290,
      createdAt: r.createdAt,
    }));

    return res.status(200).json({
      totalMovies: movies.length,
      totalUsers,
      totalShowtimes,
      totalBookings: confirmedBookings + cancelledBookings,
      confirmedBookings,
      cancelledBookings,
      totalSeatsSold,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      categoryBreakdown,
      recentBookings,
    });
  } catch (err: unknown) {
    console.error("Admin stats error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
