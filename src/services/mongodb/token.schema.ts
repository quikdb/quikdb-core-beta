import { Token, TokenType } from '@/@types';
import * as mongoose from 'mongoose';

type TokenDocument = TokenType & mongoose.Document;

const TokenSchema: mongoose.Schema = new mongoose.Schema(
  {
    token: { type: String, unique: true, required: true },
    duration: { type: Number, required: true },
    userId: { type: String, ref: 'User' },
    projectId: { type: String, ref: 'Project' },
    type: { type: String, enum: Object.values(Token), required: true },
    isValid: { type: Boolean, required: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

const TokenModel = mongoose.model<TokenDocument>('Token', TokenSchema);

export { TokenModel, TokenDocument, TokenSchema };
