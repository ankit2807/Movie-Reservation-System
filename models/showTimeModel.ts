import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IShowTime extends Document {
  startAt: string;
  format: string;
  price: number;
  theatre: string;
  screen: string;
  startDate: Date;
  endDate: Date;
  movieId: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * ShowTime schema for Mongoose.
 * Defines the structure and validations for showtime documents.
 */
const showTimeSchema = new Schema<IShowTime>(
  {
    startAt: {
      type: String,
      required: [true, "Start time is required"],
      trim: true,
    },
    format: {
      type: String,
      default: "2D",
    },
    price: {
      type: Number,
      default: 250,
    },
    theatre: {
      type: String,
      default: "PVR: Logix City Centre Mall, Noida",
    },
    screen: {
      type: String,
      default: "AUDI 01",
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
      validate: {
        validator: function (value: Date): boolean {
          const doc = this as Partial<IShowTime>;
          return !doc.startDate || value > doc.startDate;
        },
        message: "End date must be after start date",
      },
    },
    movieId: {
      type: Schema.Types.ObjectId,
      ref: "Movie",
      required: [true, "Movie ID is required"],
    },
  },
  { timestamps: true }
);

// Add index for movieId and startDate for efficient queries
showTimeSchema.index({ movieId: 1, startDate: 1 });

const ShowTime: Model<IShowTime> = mongoose.model<IShowTime>("ShowTime", showTimeSchema);

export default ShowTime;
