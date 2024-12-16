export enum OtpRequestType {
  PASSWORD = 'password',
  SIGNUP = 'signup',
  LINK = 'link',
}

export type OtpType = {
  otp: string;
  email: string;
  isValid: boolean;
};
