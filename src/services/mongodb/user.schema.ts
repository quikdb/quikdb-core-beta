import { DatabaseVersion, UserType } from '@/@types';
import * as mongoose from 'mongoose';

type UserDocument = UserType & mongoose.Document;

const CanisterDetailsSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: Object.values(DatabaseVersion), required: true },
  url: { type: String, required: true },
  owner: { type: String, required: true },
  canisterId: { type: String, unique: true, sparse: true },
  status: { type: String, required: true, default: true },
  controllers: { type: [String], required: true },
});

const UserSchema: mongoose.Schema = new mongoose.Schema(
  {
    username: { type: String, sparse: true },
    email: { type: String, unique: true, sparse: true },
    password: { type: String },
    principalId: { type: String, unique: true, sparse: true },
    credits: { type: Number, default: 0 },
    googleId: { type: String, unique: true, sparse: true },
    deleted: { type: Boolean, required: true, default: false },
    canisterDetails: { type: [CanisterDetailsSchema], default: [] },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

const UserModel = mongoose.model<UserDocument>('User', UserSchema);

export { UserModel, UserDocument, UserSchema };
