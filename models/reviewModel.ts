import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IReview extends Document {
  movieId: string;
  user: Types.ObjectId;
  rating: number;
  comment: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    movieId: {
      type: String,
      required: [true, "Review must belong to a movie"],
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 10,
      required: [true, "Rating is required"],
    },
    comment: {
      type: String,
      required: [true, "Review text is required"],
      trim: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate reviews from same user for same movie
reviewSchema.index({ movieId: 1, user: 1 }, { unique: true });

const Review: Model<IReview> = mongoose.model<IReview>("Review", reviewSchema);

export default Review;
