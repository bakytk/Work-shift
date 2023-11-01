import { Document } from "mongoose";

export interface IUser extends Document {
  userId: string;
  username: string;
  password: string;
  role: string;
}

export interface IShift extends Document {
  shiftId: string;
  userId: string;
  timeSlot: number;
  day: Date;
}

export interface TokenData {
  userId: string;
  role: string;
}
