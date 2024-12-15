import * as mongoose from 'mongoose';
import { PaymentType, PaymentStatus, DatabaseVersion } from '@/@types';

type PaymentDocument = PaymentType & mongoose.Document;

const PaymentSchema: mongoose.Schema = new mongoose.Schema(
  {
    orderId: { type: String, required: true },
    userId: {
      type: String,
      required: true,
      ref: 'User',
    },
    projectId: {
      type: String,
      required: true,
      ref: 'Project',
    },
    databaseVersion: { type: String, enum: Object.values(DatabaseVersion), required: true },
    metadata: { type: String },
    status: { type: String, enum: Object.values(PaymentStatus), required: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

const PaymentModel = mongoose.model<PaymentDocument>('Payment', PaymentSchema);

export { PaymentModel, PaymentDocument, PaymentSchema };
