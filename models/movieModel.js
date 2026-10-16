const mongoose = require("mongoose");

/**
 * Movie schema for Mongoose.
 * Defines the structure and validations for movie documents.
 */
const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      unique: true,
      trim: true,
      maxLength: [150, "Title cannot exceed 150 characters"],
      minLength: [1, "Title must have at least 1 character"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxLength: [2000, "Description cannot exceed 2000 characters"],
      minLength: [4, "Description must have at least 4 characters"],
    },
    posterImage: {
      type: String,
      default: "",
    },
    backdropImage: {
      type: String,
      default: "",
    },
    duration: {
      type: String,
      required: [true, "Duration is required"],
    },
    genre: {
      type: String,
      required: [true, "Genre is required"],
      trim: true,
    },
    languages: {
      type: [String],
      default: ["Hindi", "English"],
    },
    format: {
      type: String,
      default: "2D, IMAX 2D",
    },
    type: {
      type: String,
      enum: ["Movie", "Event", "Play", "Sport", "Activity", "Stream"],
      default: "Movie",
    },
    rating: {
      type: String,
      required: [true, "Rating is required"],
      default: "8.5",
    },
    votes: {
      type: String,
      default: "24.5K",
    },
    tagline: {
      type: String,
      default: "",
    },
    releaseDate: {
      type: Date,
      required: [true, "Release date is required"],
    },
    certification: {
      type: String,
      required: [true, "Certification is required"],
      trim: true,
      default: "UA",
    },
    showtimes: [
      {
        type: Date,
      },
    ],
    cast: [
      {
        name: { type: String, required: true },
        role: { type: String, default: "Actor" },
        image: { type: String, default: "" },
      },
    ],
    crew: [
      {
        name: { type: String, required: true },
        role: { type: String, default: "Crew" },
        image: { type: String, default: "" },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Movie", movieSchema);
