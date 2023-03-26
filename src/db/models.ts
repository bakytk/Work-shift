import { IUser, IShift } from "../types";
import { model, Schema, Model } from "mongoose";

const UserSchema: Schema = new Schema<IUser>({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: "worker"
  }
});

const ShiftSchema: Schema = new Schema<IShift>({
  shiftId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: String,
    required: true
  },
  timeSlot: {
    type: Number,
    required: true
  },
  day: {
    type: Date,
    required: true
  }
});

export const User = model("User", UserSchema);
export const Shift = model("Shift", ShiftSchema);
