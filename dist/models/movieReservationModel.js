"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
/**
 * Reservation schema for Mongoose.
 * Defines the structure and validations for movie reservation documents.
 */
const reservationSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User is required"],
    },
    movie: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Movie",
    },
    showtime: {
        type: mongoose_1.Schema.Types.ObjectId,
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
                validator: function (v) {
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
}, { timestamps: true });
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
reservationSchema.index({ showKey: 1, seats: 1 }, {
    unique: true,
    partialFilterExpression: {
        status: "CONFIRMED",
        showKey: { $type: "string" },
    },
});
const Reservation = mongoose_1.default.model("Reservation", reservationSchema);
exports.default = Reservation;
//# sourceMappingURL=movieReservationModel.js.map