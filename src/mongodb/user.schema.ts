import { UserType } from '@/@types';
import mongoose, { Document, Schema } from 'mongoose';

type UserDocument = UserType & Document;

const UserSchema: Schema = new Schema<UserType>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  principalId: { type: String, required: true },
  canisterId: { type: String, required: true },
  cyclesBalance: { type: Number, default: 0 },
});

const UserModel = mongoose.model<UserDocument>('User', UserSchema);

export { UserModel, UserDocument, UserSchema };
