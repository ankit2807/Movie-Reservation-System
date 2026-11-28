import mongoose, { Document, Model, Schema } from "mongoose";
import validator from "validator";

export interface IAdmin extends Document {
  name: string;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const adminSchema = new Schema<IAdmin>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      default: "Admin",
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (value: string): boolean {
          return validator.isEmail(value);
        },
        message: "Invalid email format",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [7, "Password must be at least 7 characters long"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Admin: Model<IAdmin> = mongoose.model<IAdmin>("Admin", adminSchema);

export default Admin;
