export enum OtpRequestType {
  PASSWORD = 'password',
  SIGNUP = 'signup',
}

export type OtpType = {
  otp: string;
  email: string;
  isValid: boolean;
};
