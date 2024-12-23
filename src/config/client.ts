import * as mongoose from 'mongoose';
import { ApiError } from '../utils';
import { StatusCode } from '../@types';
import { AUTH_MONGO_URI } from '@/config';

class MongoDBClient {
  private static instance: MongoDBClient;
  private connection: mongoose.Connection | null = null;
  private uri: string | null = null;

  private constructor(uri: string) {
    this.uri = uri;
  }

  /**
   * Singleton method to get or create the MongoDBClient instance.
   */
  public static async getInstance(): Promise<MongoDBClient> {
    if (!MongoDBClient.instance) {
      const uri = AUTH_MONGO_URI;
      if (!uri) {
        throw new ApiError('Invalid Mongo URI', 'MongoDBClient.getInstance', StatusCode.INTERNAL_SERVER_ERROR);
      }
      MongoDBClient.instance = new MongoDBClient(uri);
    }
    return MongoDBClient.instance;
  }

  /**
   * Establishes a Mongoose connection.
   */
  public async connect(): Promise<mongoose.Connection | null> {
    if (this.connection && this.connection.readyState === mongoose.ConnectionStates?.connected) {
      console.log('Mongoose is already connected.');
      return this.connection;
    }

    if (!this.uri) {
      throw new ApiError('Invalid Mongo URI', 'MongoDBClient.connect', StatusCode.INTERNAL_SERVER_ERROR);
    }

    try {
      const mongooseInstance = await mongoose.connect(this.uri);
      this.connection = mongooseInstance.connection;

      console.log('connected to mongodb');

      this.connection.on('connected', () => {
        console.log('Mongoose connected successfully.');
      });

      this.connection.on('error', err => {
        console.error('Mongoose connection error:', err);
      });

      this.connection.on('disconnected', () => {
        console.warn('Mongoose connection lost.');
      });

      return this.connection;
    } catch (err) {
      console.error('Error connecting to Mongoose:', err);
      throw new ApiError('Error connecting to MongoDB', 'MongoDBClient.connect', StatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  public initGridFSBucket(connection: mongoose.Connection) {
    const db = connection.db;
    const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'quikdb' });
    console.log('GridFS Bucket Initialized');
    return bucket;
  }

  /**
   * Closes the MongoDB and Mongoose connections.
   */
  public async close(): Promise<void> {
    if (this.connection) {
      await this.connection.close();
      console.log('Mongoose connection closed.');
    }
  }
}

export { MongoDBClient, mongoose };
