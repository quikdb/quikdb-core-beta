import { DatabaseVersion } from './project.types';

export type PaymentType = {
  orderId: string;
  userId: string;
  amount: number;
  status: PaymentStatus;
  projectId: string;
  databaseVersion: DatabaseVersion;
  metadata: string;
};

export enum PaymentStatus {
  INITIATED = 'initiated',
  COMPLETED = 'completed',
  PROCESSING = 'processing',
}
