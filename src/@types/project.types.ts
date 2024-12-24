export type ProjectType = {
  name: string;
  owner: string;
  code?: string;
  isActive: boolean;
  databaseVersion: DatabaseVersion;
  url?: string;
  canisterId?: string;
  controllers?: string[];
};

export enum DatabaseVersion {
  FREE = 'free',
  PREMIUM = 'premium',
  PROFESSIONAL = 'professional',
}
