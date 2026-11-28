import mongoose, { Document, Model, Schema } from "mongoose";
import validator from "validator";

export type UserGender = "Male" | "Female" | "Other";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  firstName: string;
  lastName: string;
  gender?: UserGender;
  isMarried: boolean;
  birthday: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * User schema for Mongoose.
 * Defines the structure and validations for user documents.
 */
const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxLength: [50, "Name cannot exceed 50 characters"],
      minLength: [2, "Name must have at least 2 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (value: string): boolean => validator.isEmail(value),
        message: "Invalid email format",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      validate: {
        validator: (v: string): boolean => /^\d{10}$/.test(v),
        message: "Phone number must be 10 digits",
      },
    },
    firstName: {
      type: String,
      trim: true,
      default: "",
    },
    lastName: {
      type: String,
      trim: true,
      default: "",
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    isMarried: {
      type: Boolean,
      default: false,
    },
    birthday: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;
