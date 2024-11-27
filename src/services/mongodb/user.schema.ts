import { UserType } from '@/@types';
import * as mongoose from 'mongoose';

type UserDocument = UserType & mongoose.Document;

const CanisterDetailsSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  owner: { type: String, required: true },
  canisterId: { type: String, required: true },
  status: { type: String, required: true },
  controllers: { type: [String], required: true },
});

const UserSchema: mongoose.Schema = new mongoose.Schema(
  {
    username: { type: String, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    principalId: { type: String, unique: true },
    canisterId: { type: String, unique: true },
    cyclesBalance: { type: Number, default: 0 },
    googleId: { type: String, unique: true, sparse: true },
    deleted: { type: Boolean, required: true, default: false },
    canisterDetails: { type: [CanisterDetailsSchema], default: [] },
  },
  { timestamps: true },
);

const UserModel = mongoose.model<UserDocument>('User', UserSchema);

export { UserModel, UserDocument, UserSchema };
