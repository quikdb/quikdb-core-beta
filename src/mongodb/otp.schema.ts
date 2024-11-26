import { OtpType } from '@/@types';
import mongoose from 'mongoose';

type OtpDocument = OtpType & mongoose.Document;

const OtpSchema = new mongoose.Schema<OtpDocument>(
  {
    otp: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    isValid: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false,
  },
);

const OTPModel = mongoose.model<OtpDocument>('OTP', OtpSchema);

export { OTPModel, OtpSchema, OtpDocument };
