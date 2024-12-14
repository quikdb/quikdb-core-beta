import { MongoDBClient, mongoose } from '@/config';

/**
 * Function for mongo tools methods
 * @function MongoTools
 */
export class MongoTools {
  static async InitMongo(): Promise<mongoose.mongo.GridFSBucket> {
    const client = await MongoDBClient.getInstance();
    if (!client) {
      console.error('Failed to get MongoDBClient instance');
      return;
    }

    const connection = await client.connect();
    if (!connection) {
      console.error('Failed to connect to MongoDB');
      return;
    }

    return client.initGridFSBucket(connection);
  }

  static BuildQuery<T extends object>(excludedKeys: (keyof T)[], requestBody: T): Partial<T> {
    const query: Partial<T> = {};

    Object.keys(requestBody).forEach(key => {
      if (!excludedKeys.includes(key as keyof T) && requestBody[key as keyof T] !== undefined) {
        query[key as keyof T] = requestBody[key as keyof T];
      }
    });

    return query;
  }
}
