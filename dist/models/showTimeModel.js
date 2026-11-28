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
 * ShowTime schema for Mongoose.
 * Defines the structure and validations for showtime documents.
 */
const showTimeSchema = new mongoose_1.Schema({
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
            validator: function (value) {
                return value > this.startDate;
            },
            message: "End date must be after start date",
        },
    },
    movieId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Movie",
        required: [true, "Movie ID is required"],
    },
}, { timestamps: true });
// Add index for movieId and startDate for efficient queries
showTimeSchema.index({ movieId: 1, startDate: 1 });
const ShowTime = mongoose_1.default.model("ShowTime", showTimeSchema);
exports.default = ShowTime;
//# sourceMappingURL=showTimeModel.js.map