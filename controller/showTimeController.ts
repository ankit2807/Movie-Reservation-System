import type { Request, Response } from "express";
import ShowTime from "../models/showTimeModel";
import Movie from "../models/movieModel";

const ALLOWED_SHOWTIME_FIELDS = [
  "movieId",
  "theatre",
  "screen",
  "format",
  "price",
  "startAt",
  "startDate",
  "endDate",
] as const;

type AllowedShowtimeField = (typeof ALLOWED_SHOWTIME_FIELDS)[number];

const isAllowedField = (key: string): key is AllowedShowtimeField =>
  (ALLOWED_SHOWTIME_FIELDS as readonly string[]).includes(key);

/**
 * Add a new showtime (admin only).
 */
export const addShowTime = async (req: Request, res: Response): Promise<Response> => {
  try {
    const body = req.body as Record<string, unknown>;
    const { movieId, startAt } = body;

    if (!movieId || !/^[0-9a-fA-F]{24}$/.test(String(movieId))) {
      return res.status(400).json({ message: "Valid movieId is required" });
    }

    const movie = await Movie.findById(String(movieId));
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    const existingShowtime = await ShowTime.findOne({
      movieId: String(movieId),
      startAt: String(startAt || "").trim(),
      theatre: String(body.theatre || "PVR: Logix City Centre Mall, Noida").trim(),
    });
    if (existingShowtime) {
      return res.status(409).json({
        message: "Showtime already exists for this movie, theatre, and start time",
      });
    }

    const payload: Partial<Record<AllowedShowtimeField, unknown>> = {};
    for (const key of ALLOWED_SHOWTIME_FIELDS) {
      if (body[key] !== undefined) payload[key] = body[key];
    }

    const showtime = new ShowTime(payload);
    const savedShowtime = await showtime.save();
    return res.status(201).json(savedShowtime);
  } catch (err: unknown) {
    console.error("Add showtime error:", err);
    const e = err as { name?: string; message?: string };
    if (e.name === "ValidationError") {
      return res.status(400).json({ message: e.message || "Validation error" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get all showtimes.
 */
export const getShowTimes = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const showtimes = await ShowTime.find({}).populate("movieId");
    return res.status(200).json(showtimes);
  } catch (err: unknown) {
    console.error("Get showtimes error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get a showtime by ID.
 */
export const getShowTimeById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const id = String(req.params.id || "");
    if (id.startsWith("bms__")) {
      const parts = id.split("__");
      const movieId = parts[1] || "";
      const movie = /^[0-9a-fA-F]{24}$/.test(movieId)
        ? await Movie.findById(movieId)
        : await Movie.findOne({});
      if (!movie) {
        return res.status(404).json({ message: "Showtime movie not found" });
      }
      return res.status(200).json({
        _id: id,
        startAt: "07:30 PM",
        format: "2D",
        price: 290,
        theatre: parts[2] || "PVR: Logix City Centre Mall, Noida",
        screen: "AUDI 01",
        movieId: movie,
      });
    }
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(404).json({ message: "Showtime not found" });
    }
    const showtime = await ShowTime.findById(id).populate("movieId");
    if (!showtime) {
      return res.status(404).json({ message: "Showtime not found" });
    }
    return res.status(200).json(showtime);
  } catch (err: unknown) {
    console.error("Get showtime error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Update a showtime by ID (admin only).
 */
export const updateShowTimeById = async (req: Request, res: Response): Promise<Response> => {
  const id = String(req.params.id || "");
  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    return res.status(400).json({ message: "Invalid showtime ID" });
  }

  const body = (req.body || {}) as Record<string, unknown>;
  const updates = Object.keys(body);
  const isValidOperation = updates.length > 0 && updates.every(isAllowedField);

  if (!isValidOperation) {
    return res.status(400).json({ message: "Invalid updates!" });
  }

  try {
    const showtime = await ShowTime.findById(id);
    if (!showtime) {
      return res.status(404).json({ message: "Showtime not found" });
    }

    for (const update of updates) {
      showtime.set(update, body[update]);
    }
    await showtime.save();
    return res.status(200).json(showtime);
  } catch (err: unknown) {
    console.error("Update showtime error:", err);
    const e = err as { name?: string; message?: string };
    if (e.name === "ValidationError") {
      return res.status(400).json({ message: e.message || "Validation error" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Delete a showtime by ID (admin only).
 */
export const deleteShowTime = async (req: Request, res: Response): Promise<Response> => {
  try {
    const id = String(req.params.id || "");
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({ message: "Invalid showtime ID" });
    }
    const deletedShowtime = await ShowTime.findByIdAndDelete(id);
    if (!deletedShowtime) {
      return res.status(404).json({ message: "Showtime not found" });
    }
    return res.status(200).json({ message: "Showtime deleted successfully" });
  } catch (err: unknown) {
    console.error("Delete showtime error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
