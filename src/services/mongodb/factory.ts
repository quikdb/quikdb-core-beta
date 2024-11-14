import { Document } from 'mongoose';
import { IMongoServiceConfig } from '../../@types';
import { MongoApiService } from '../mongo.service';

/**
 * Factory function to create a MongoApiService instance based on the provided configuration.
 * @param config - The service configuration.
 * @returns An instance of MongoApiService.
 */
export const createMongoService = <T extends Document>(
  config: IMongoServiceConfig<T>
): MongoApiService<T> => {
  return new MongoApiService<T>(config.clientName, config.modelName, config.schema);
};
