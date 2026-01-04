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
      maxLength: [30, "Title cannot exceed 30 characters"],
      minLength: [1, "Title must have at least 1 character"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxLength: [100, "Description cannot exceed 100 characters"],
      minLength: [4, "Description must have at least 4 characters"],
    },
    posterImage: {
      type: String,
      default: "",
    },
    duration: {
      type: String,
      required: [true, "Duration is required"],
      validate: {
        validator: function (v) {
          return /^\d{1,2}:\d{2}$/.test(v); // HH:MM format
        },
        message: "Duration must be in HH:MM format",
      },
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
    type: {
      type: String,
      enum: ['Movie', 'Event', 'Play', 'Sport', 'Activity', 'Stream'],
      default: 'Movie'
    },
    rating: {
      type: String,
      required: [true, "Rating is required"],
      enum: ["G", "PG", "PG-13", "R", "NC-17"], // Common ratings
      message: "Invalid rating",
    },
    releaseDate: {
      type: Date,
      required: [true, "Release date is required"],
    },
    certification: {
      type: String,
      required: [true, "Certification is required"],
      trim: true,
    },
    showtimes: [
      {
        type: Date,
        required: true,
      },
    ],
    cast: [
      {
        name: { type: String, required: true },
        role: { type: String, default: 'Actor' },
        image: { type: String }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Movie", movieSchema);
