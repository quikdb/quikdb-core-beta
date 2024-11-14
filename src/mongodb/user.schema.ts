import { UserType } from '@/@types';
import mongoose, { Document, Schema } from 'mongoose';

type UserDocument = UserType & Document;

const CanisterDetailsSchema = new Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  owner: { type: String, required: true },
  canisterId: { type: String, required: true },
  status: { type: String, required: true },
  controllers: { type: [String], required: true },
});

const UserSchema: Schema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    principalId: { type: String, required: true },
    canisterId: { type: String, required: true },
    cyclesBalance: { type: Number, default: 0 },
    googleId: { type: String, unique: true, sparse: true },
    deleted: { type: Boolean, required: true, default: false },
    canisterDetails: { type: [CanisterDetailsSchema], default: [] },
  },
  { timestamps: true },
);

const UserModel = mongoose.model<UserDocument>('User', UserSchema);

export { UserModel, UserDocument, UserSchema };
