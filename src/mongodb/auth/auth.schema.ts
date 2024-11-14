import mongooseLeanVirtuals from 'mongoose-lean-virtuals';
import { Schema, Document, model } from 'mongoose';
import { MobileDto, ProfileTypes, Countries, UserOnboardStage, KYC } from '../../@types';
import { Utils } from '../../utils';
import { ProfileDocument } from './profile.schema';

export type AuthDocument = Document & {
  publicId: string;
  email: string;
  isActive: boolean;
  mobile: MobileDto;
  password: string;
  referralCode: string;
  uniqueId: string;
  profileType: ProfileTypes;
  country: Countries;
  verifications: Record<string, boolean>;
  verificationCodes: any;
  onBoardingStage: UserOnboardStage;
  kycType: KYC;
  kycData: any;
  plaid: any;
  deleted: boolean;
  profile: ProfileDocument;
};

const authSchema = new Schema<AuthDocument>(
  {
    publicId: {
      type: String,
      unique: true,
      default: () => Utils.generateUniqueId('auth'),
    },
    email: {
      type: String,
      lowercase: true,
    },
    mobile: {
      phoneNumber: {
        type: String,
        required: true,
      },
      isoCode: {
        type: String,
        default: 'NG',
      },
    },
    password: {
      type: String,
      select: false,
    },
    referralCode: {
      type: String,
    },
    uniqueId: {
      type: String,
      required: true,
      unique: true,
    },
    profileType: {
      type: String,
      enum: ProfileTypes,
    },
    country: {
      type: String,
      enum: Countries,
    },
    verifications: {
      uniqueId: {
        type: Boolean,
        default: false,
      },
      email: {
        type: Boolean,
        default: false,
      },
      mobile: {
        type: Boolean,
        default: false,
      },
    },
    verificationCodes: {
      type: Schema.Types.Mixed,
    },
    onBoardingStage: {
      type: Number,
      default: UserOnboardStage.ON_BOARDING,
    },
    kycType: {
      type: String,
      enum: KYC,
      required: true,
    },
    kycData: {
      type: Object,
      select: false,
    },
    plaid: {
      type: String,
      select: false,
    },
    deleted: {
      type: Boolean,
      default: false,
      select: false,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

authSchema.statics.config = () => {
  return {
    idToken: 'aut',
    uniques: ['mobile', 'email'],
    fillables: [],
    softDelete: true,
    updateFillables: [],
    hiddenFields: ['deleted', 'password'],
  };
};

authSchema.virtual('profile', {
  ref: 'Profile',
  localField: '_id',
  foreignField: 'auth',
  justOne: true,
  match: {
    deleted: false,
    isDefault: true,
  },
});

authSchema.virtual('userRole', {
  ref: 'UserRole',
  localField: '_id',
  foreignField: 'auth',
  justOne: true,
  match: {
    deleted: false,
    isDefault: true,
  },
});

authSchema.plugin(mongooseLeanVirtuals);

const AuthModel = model<AuthDocument>('Auth', authSchema);

export { AuthModel, authSchema };
