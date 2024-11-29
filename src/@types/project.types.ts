export type ProjectType = {
  name: string;
  owner: string;
  code?: string;
  isActive: boolean;
};

export enum DatabaseVersion {
  FREE = 'free',
  PREMIUM = 'premium',
  PROFESSIONAL = 'professional',
}
