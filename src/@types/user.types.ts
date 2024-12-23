import { DatabaseVersion } from './project.types';

export type UserType = {
  username: string;
  email: string;
  password: string;
  principalId: string;
  canisterId: string;
  credits: number;
  googleId: string;
  canisterDetails: CanisterDetails[];
};

export type CanisterDetails = {
  name: string;
  url: string;
  owner: string;
  databaseVersion: DatabaseVersion;
  canisterId: string;
  projectId: string;
  status?: string;
  controllers: string[];
};
