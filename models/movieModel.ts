import mongoose, { Document, Model, Schema } from "mongoose";

export type MovieCategory = "Movie" | "Event" | "Play" | "Sport" | "Activity" | "Stream";

export interface IPersonCredit {
  name: string;
  role?: string;
  image?: string;
}

export interface IMovie extends Document {
  title: string;
  description: string;
  posterImage: string;
  backdropImage: string;
  duration: string;
  genre: string;
  languages: string[];
  format: string;
  type: MovieCategory;
  rating: string;
  votes: string;
  tagline: string;
  releaseDate: Date;
  certification: string;
  showtimes: Date[];
  cast: IPersonCredit[];
  crew: IPersonCredit[];
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Movie schema for Mongoose.
 * Defines the structure and validations for movie documents.
 */
const movieSchema = new Schema<IMovie>(
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

const Movie: Model<IMovie> = mongoose.model<IMovie>("Movie", movieSchema);

export default Movie;
