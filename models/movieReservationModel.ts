import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type ReservationStatus = "CONFIRMED" | "CANCELLED";
export type PaymentProvider = "STRIPE" | "DEMO";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "PARTIALLY_REFUNDED";

export interface ITheatreSnapshot {
  id?: string;
  name?: string;
  address?: string;
  screen?: string;
}

export interface ISeatDetail {
  seat: string;
  tier: string;
  price: number;
}

export interface IFoodLine {
  id: string;
  name: string;
  qty: number;
  price: number;
}

export interface IReservationAmounts {
  tickets: number;
  convenienceFee: number;
  gst: number;
  food: number;
  discount: number;
  total: number;
}

export interface IContactInfo {
  email?: string;
  phone?: string;
}

export interface IReservation extends Document {
  user: Types.ObjectId;
  movie?: Types.ObjectId;
  showtime?: Types.ObjectId;
  showKey?: string;
  bookingId?: string;
  status: ReservationStatus;
  cancelledAt?: Date;
  refundAmount?: number;
  movieRef?: string;
  movieTitle?: string;
  posterImage?: string;
  certification?: string;
  language?: string;
  format?: string;
  theatre?: ITheatreSnapshot;
  showDate?: string;
  showTime?: string;
  showDateTime?: Date;
  seatDetails: ISeatDetail[];
  food: IFoodLine[];
  amounts?: IReservationAmounts;
  promoCode?: string;
  paymentMethod?: string;
  paymentProvider: PaymentProvider;
  paymentStatus: PaymentStatus;
  paymentIntentId?: string;
  stripeRefundId?: string;
  contact?: IContactInfo;
  seats: string[];
  date: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Reservation schema for Mongoose.
 * Defines the structure and validations for movie reservation documents.
 */
const reservationSchema = new Schema<IReservation>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    movie: {
      type: Schema.Types.ObjectId,
      ref: "Movie",
    },
    showtime: {
      type: Schema.Types.ObjectId,
      ref: "ShowTime",
    },
    showKey: {
      type: String,
      trim: true,
      index: true,
    },
    bookingId: {
      type: String,
      index: true,
    },
    status: {
      type: String,
      enum: ["CONFIRMED", "CANCELLED"],
      default: "CONFIRMED",
    },
    cancelledAt: Date,
    refundAmount: Number,
    movieRef: String,
    movieTitle: String,
    posterImage: String,
    certification: String,
    language: String,
    format: String,
    theatre: {
      id: String,
      name: String,
      address: String,
      screen: String,
    },
    showDate: String,
    showTime: String,
    showDateTime: Date,
    seatDetails: [
      {
        _id: false,
        seat: String,
        tier: String,
        price: Number,
      },
    ],
    food: [
      {
        _id: false,
        id: String,
        name: String,
        qty: Number,
        price: Number,
      },
    ],
    amounts: {
      tickets: { type: Number, default: 0 },
      convenienceFee: { type: Number, default: 0 },
      gst: { type: Number, default: 0 },
      food: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    promoCode: {
      type: String,
      trim: true,
    },
    paymentMethod: String,
    paymentProvider: {
      type: String,
      enum: ["STRIPE", "DEMO"],
      default: "DEMO",
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "REFUNDED", "PARTIALLY_REFUNDED"],
      default: "PAID",
    },
    paymentIntentId: {
      type: String,
      trim: true,
    },
    stripeRefundId: {
      type: String,
      trim: true,
    },
    contact: {
      email: String,
      phone: String,
    },
    seats: [
      {
        type: String,
        required: true,
        validate: {
          validator: function (v: string): boolean {
            return /^[A-Z]\d+$/.test(v);
          },
          message: "Seat must be in format like A1 or B10",
        },
      },
    ],
    date: {
      type: Date,
      required: [true, "Reservation date is required"],
    },
  },
  { timestamps: true }
);

// Ensure seats array is not empty (modern promise/sync style without deprecated callback `next`)
reservationSchema.pre("save", function () {
  if (!Array.isArray(this.seats) || this.seats.length === 0) {
    throw new Error("At least one seat must be selected");
  }
});

// Add index for user and showtime for efficient queries
reservationSchema.index({ user: 1, showtime: 1 });
reservationSchema.index({ showtime: 1, date: 1 });
reservationSchema.index({ showKey: 1, status: 1 });
reservationSchema.index({ paymentIntentId: 1 }, { unique: true, sparse: true });
// Atomic multikey partial unique index preventing concurrent double-booking of any seat on a showKey
reservationSchema.index(
  { showKey: 1, seats: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: "CONFIRMED",
      showKey: { $type: "string" },
    },
  }
);

const Reservation: Model<IReservation> = mongoose.model<IReservation>("Reservation", reservationSchema);

export default Reservation;
