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
 * Movie schema for Mongoose.
 * Defines the structure and validations for movie documents.
 */
const movieSchema = new mongoose_1.Schema({
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
}, { timestamps: true });
const Movie = mongoose_1.default.model("Movie", movieSchema);
exports.default = Movie;
//# sourceMappingURL=movieModel.js.map