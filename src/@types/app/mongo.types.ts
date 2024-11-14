import { ClientSession, PopulateOptions, FlattenMaps, Require_id, Schema, Document } from '../../services';

export enum ClientNames {
  AUTH = 'auth',
}

export type PaginatedResult<T> = {
  data: Require_id<FlattenMaps<T>>[];
  total: number;
  page: number;
  limit: number;
};

export type DbOptions = {
  session: ClientSession | null;
  populate?: PopulateOptions | (string | PopulateOptions)[];
  page?: number;
  limit?: number;
  hiddenFields?: string[];
};

export interface IMongoServiceConfig<T extends Document> {
  serviceName: string;
  clientName: string;
  modelName: string;
  schema: Schema<T>;
}
