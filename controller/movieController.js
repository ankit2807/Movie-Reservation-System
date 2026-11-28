const Movie = require("../models/movieModel");
const { seedDB } = require("../utils/seedData");

// ─── TMDB Configuration (Optional enrichment via env variable only) ───────────
const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMAGE = "https://image.tmdb.org/t/p/w500";
const TMDB_IMAGE_ORIGINAL = "https://image.tmdb.org/t/p/original";

const ALLOWED_MOVIE_FIELDS = [
  "title",
  "description",
  "posterImage",
  "backdropImage",
  "duration",
  "genre",
  "languages",
  "format",
  "type",
  "rating",
  "votes",
  "tagline",
  "releaseDate",
  "certification",
  "cast",
  "crew",
];

const pickAllowedMovieFields = (body = {}) => {
  const clean = {};
  for (const field of ALLOWED_MOVIE_FIELDS) {
    if (body[field] !== undefined) {
      clean[field] = body[field];
    }
  }
  return clean;
};

const fmtRuntime = (mins) => {
  if (!mins) return "2h 15m";
  if (typeof mins === "string") {
    if (/^\d{1,2}:\d{2}$/.test(mins)) {
      const [h, m] = mins.split(":");
      return `${Number(h)}h ${Number(m)}m`;
    }
    return mins;
  }
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
};

const getCertification = (voteAvg) => {
  if (voteAvg >= 6) return "UA";
  return "A";
};

// Normalize a MongoDB Movie document so all MovieBook UI fields are present
const normalizeMongoMovie = (doc) => {
  const m = doc.toObject ? doc.toObject() : doc;
  const isLegacyMpaa = ["G", "PG", "PG-13", "R", "NC-17"].includes(m.rating);
  const numericRating = isLegacyMpaa ? "8.7" : m.rating || "8.6";

  return {
    ...m,
    _id: String(m._id),
    rating: numericRating,
    votes: m.votes || "142.5K",
    duration: fmtRuntime(m.duration),
    certification: m.certification || "UA",
    format: m.format || "2D, IMAX 2D",
    languages: Array.isArray(m.languages) && m.languages.length > 0 ? m.languages : ["Hindi", "English"],
    backdropImage: m.backdropImage || m.posterImage,
    cast: (m.cast || []).map((c) => ({
      name: c.name,
      role: c.role || "Lead Cast",
      image: c.image || "",
    })),
    crew:
      Array.isArray(m.crew) && m.crew.length > 0
        ? m.crew
        : [
            { name: "Nitesh Tiwari", role: "Director" },
            { name: "A. R. Rahman", role: "Music Director" },
            { name: "Namit Malhotra", role: "Producer" },
          ],
  };
};

let autoSeedPromise = null;
const ensureFreshDatabase = async () => {
  const movies = await Movie.find();
  if (process.env.AUTO_SEED === "false") {
    return movies;
  }
  const hasLegacyData =
    movies.length === 0 ||
    movies.some((m) => ["G", "PG", "PG-13", "R", "NC-17"].includes(m.rating));

  if (hasLegacyData) {
    if (!autoSeedPromise) {
      autoSeedPromise = seedDB().finally(() => {
        autoSeedPromise = null;
      });
    }
    await autoSeedPromise;
    return await Movie.find();
  }
  return movies;
};

/**
 * Add a new movie (admin only).
 */
const addMovie = async (req, res) => {
  try {
    const payload = pickAllowedMovieFields(req.body);
    const newMovie = new Movie(payload);
    const savedMovie = await newMovie.save();
    return res.status(201).json(normalizeMongoMovie(savedMovie));
  } catch (err) {
    console.error("Add movie error:", err);
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
    if (err.code === 11000) {
      return res.status(409).json({ message: "Movie with this title already exists" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Update a movie by ID (admin only).
 */
const updateMovie = async (req, res) => {
  try {
    if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
      return res.status(400).json({ message: "Invalid movie ID" });
    }
    const payload = pickAllowedMovieFields(req.body);
    const updatedMovie = await Movie.findByIdAndUpdate(
      req.params.id,
      { $set: payload },
      { new: true, runValidators: true }
    );
    if (!updatedMovie) {
      return res.status(404).json({ message: "Movie not found" });
    }
    return res.status(200).json(normalizeMongoMovie(updatedMovie));
  } catch (err) {
    console.error("Update movie error:", err);
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Delete a movie by ID (admin only).
 */
const deleteMovie = async (req, res) => {
  try {
    if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
      return res.status(400).json({ message: "Invalid movie ID" });
    }
    const deletedMovie = await Movie.findByIdAndDelete(req.params.id);
    if (!deletedMovie) {
      return res.status(404).json({ message: "Movie not found" });
    }
    return res.status(200).json({ message: "Movie deleted successfully" });
  } catch (err) {
    console.error("Delete movie error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get a movie by ID.
 */
const getMovieById = async (req, res) => {
  try {
    await ensureFreshDatabase();
    const id = String(req.params.id || "");

    if (id === "ET00481645" || id.toLowerCase() === "street-fighter") {
      const sfMovie = await Movie.findOne({ title: /street fighter/i });
      if (sfMovie) return res.status(200).json(normalizeMongoMovie(sfMovie));
    }

    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      const movie = await Movie.findById(id);
      if (movie) return res.status(200).json(normalizeMongoMovie(movie));
    }

    const tmdbMovieMatch = id.match(/^tmdb_mv_(\d+)$/);
    const tmdbTvMatch = id.match(/^tmdb_tv_(\d+)$/);
    const tmdbKey = process.env.TMDB_API_KEY;

    if ((tmdbMovieMatch || tmdbTvMatch) && tmdbKey) {
      const isTv = Boolean(tmdbTvMatch);
      const tmdbId = isTv ? tmdbTvMatch[1] : tmdbMovieMatch[1];
      const endpoint = isTv ? "tv" : "movie";

      try {
        const url = `${TMDB_BASE}/${endpoint}/${tmdbId}?api_key=${encodeURIComponent(tmdbKey)}&append_to_response=credits`;
        const response = await fetch(url, { signal: AbortSignal.timeout(2500) });
        if (response.ok) {
          const data = await response.json();
          const genres = (data.genres || []).map((g) => g.name).join(", ") || "Action, Drama";
          const cast = (data.credits?.cast || []).slice(0, 12).map((c) => ({
            name: c.name,
            role: c.character || "Lead Cast",
            image: c.profile_path ? `${TMDB_IMAGE}${c.profile_path}` : "",
          }));
          const crewList = (data.credits?.crew || [])
            .filter((c) => ["Director", "Producer", "Original Music Composer", "Director of Photography"].includes(c.job))
            .slice(0, 6)
            .map((c) => ({
              name: c.name,
              role: c.job === "Original Music Composer" ? "Music Director" : c.job,
              image: c.profile_path ? `${TMDB_IMAGE}${c.profile_path}` : "",
            }));

          return res.status(200).json({
            _id: id,
            tmdbId: data.id,
            mediaType: isTv ? "tv" : "movie",
            title: data.title || data.name,
            genre: genres,
            duration: fmtRuntime(data.runtime || data.episode_run_time?.[0]),
            rating: data.vote_average ? data.vote_average.toFixed(1) : "8.6",
            votes: data.vote_count ? `${Math.max(1, Math.floor(data.vote_count / 1000))}K+` : "45K+",
            type: "Movie",
            description: data.overview || "No description available.",
            posterImage: data.poster_path ? `${TMDB_IMAGE}${data.poster_path}` : "",
            backdropImage: data.backdrop_path ? `${TMDB_IMAGE_ORIGINAL}${data.backdrop_path}` : "",
            releaseDate: data.release_date || data.first_air_date || new Date().toISOString(),
            languages:
              (data.spoken_languages || []).map((l) => l.english_name).filter(Boolean).slice(0, 4).length > 0
                ? (data.spoken_languages || []).map((l) => l.english_name).filter(Boolean).slice(0, 4)
                : ["Hindi", "English"],
            certification: getCertification(data.vote_average || 8),
            format: "2D, IMAX 2D, 4DX",
            cast,
            crew: crewList,
            tagline: data.tagline || "",
          });
        }
      } catch {
        // Fallback to local catalog if TMDB is unreachable
      }
    }

    const fallbackMovie = await Movie.findOne();
    if (fallbackMovie) {
      return res.status(200).json(normalizeMongoMovie(fallbackMovie));
    }
    return res.status(404).json({ message: "Movie not found" });
  } catch (err) {
    console.error("Get movie error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get all movies, streams, events, plays, sports, and activities.
 */
const getMovies = async (_req, res) => {
  try {
    const dbMovies = await ensureFreshDatabase();
    const normalized = dbMovies.map(normalizeMongoMovie);
    return res.status(200).json(normalized);
  } catch (err) {
    console.error("Get movies error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Search movies across MongoDB safely with escaped regex & bounded input length.
 */
const searchMovies = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== "string" || q.trim().length === 0) {
      return res.status(200).json([]);
    }

    const query = q.trim().slice(0, 100);
    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

    const dbMovies = await ensureFreshDatabase();
    const localMatches = dbMovies
      .filter(
        (m) =>
          regex.test(m.title) ||
          regex.test(m.genre) ||
          regex.test(m.type) ||
          regex.test(m.description) ||
          (m.languages || []).some((l) => regex.test(l)) ||
          (m.cast || []).some((c) => regex.test(c.name))
      )
      .map(normalizeMongoMovie);

    return res.status(200).json(localMatches);
  } catch (err) {
    console.error("Search error:", err);
    return res.status(500).json({ message: "Search failed" });
  }
};

module.exports = {
  addMovie,
  updateMovie,
  deleteMovie,
  getMovieById,
  getMovies,
  searchMovies,
};
