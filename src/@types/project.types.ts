export type ProjectType = {
  name: string;
  type: ProjectVersion;
  code?: string;
  isActive: boolean;
};

export enum ProjectVersion {
  FREE = 'free',
  PREMIUM = 'premium',
  PROFESSIONAL = 'professional',
}
