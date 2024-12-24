import { UserType } from '@/@types';
import * as mongoose from 'mongoose';

type UserDocument = UserType & mongoose.Document;

const UserSchema: mongoose.Schema = new mongoose.Schema(
  {
    username: { type: String, sparse: true },
    email: { type: String, unique: true, sparse: true },
    password: { type: String },
    principalId: { type: String, unique: true, sparse: true },
    credits: { type: Number, default: 0 },
    googleId: { type: String, unique: true, sparse: true },
    deleted: { type: Boolean, required: true, default: false },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

const UserModel = mongoose.model<UserDocument>('User', UserSchema);

export { UserModel, UserDocument, UserSchema };
