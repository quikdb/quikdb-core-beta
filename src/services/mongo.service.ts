import mongoose, {
  Model,
  ClientSession,
  FilterQuery,
  QueryOptions,
  Require_id,
  FlattenMaps,
  PopulateOptions,
  UpdateQuery,
  PipelineStage,
  Connection,
  Types,
  Schema,
  Document,
} from 'mongoose';
import { DbOptions, GenericAnyType, PaginatedResult, ServiceResponse, StatusCode } from '../@types';
import { ApiError } from '../utils';
import { ObjectId } from 'bson';
import { OtpDocument, OTPModel, UserDocument, UserModel } from '@/services/mongodb';
import { AUTH_MONGO_URI, MongoDBClient } from '@/config';

// Define MongoDB URIs based on client names
export const MONGO_URIS: { [clientName: string]: string } = {
  auth: AUTH_MONGO_URI || '',
  // Add more clients and their URIs as needed
};

export class BaseService<T extends Document> {
  protected model: Model<T> | null;

  constructor(model?: Model<T>) {
    this.model = model ? model : null;
  }

  private validateModel() {
    if (!this.model) throw new ApiError('Please add a model', 'BaseService.validateModel', StatusCode.BAD_REQUEST);
  }

  private getSelectedFields = (hiddenFields: string[]) => {
    return hiddenFields.map(field => `+${field}`).join(' ');
  };

  protected async create(data: Partial<T>, session: ClientSession | null = null): Promise<T> {
    this.validateModel();
    const newDocument = new this.model(data);
    return newDocument.save({ session });
  }

  protected async findById(id: ObjectId, options?: DbOptions): Promise<T | null> {
    this.validateModel();
    console.log({ options });
    let query = this.model?.findById(id).session(options?.session ? options.session : null) as mongoose.Query<T | null, T>;
    if (options?.populate && query) {
      query = query.populate(options?.populate);
    }
    if (options?.hiddenFields && options?.hiddenFields.length > 0 && query) {
      query = query.select(this.getSelectedFields(options?.hiddenFields));
    }
    return query.lean({ virtuals: true }).exec() as Promise<T | null>;
  }

  protected async findOne(query: FilterQuery<T>, queryOptions: QueryOptions, options?: DbOptions): Promise<Require_id<FlattenMaps<T>> | null> {
    this.validateModel();
    let mongooseQuery = this.model?.findOne(query, {}, queryOptions).session(options?.session ? options.session : null) as mongoose.Query<
      T | null,
      T
    >;
    if (options?.populate && mongooseQuery) {
      mongooseQuery = mongooseQuery.populate(options?.populate);
    }
    if (options?.hiddenFields && options?.hiddenFields.length > 0 && mongooseQuery) {
      mongooseQuery = mongooseQuery.select(this.getSelectedFields(options?.hiddenFields));
    }
    return mongooseQuery.lean({ virtuals: true }).exec() as unknown as Promise<mongoose.Require_id<mongoose.FlattenMaps<T>>> | null;
  }

  protected async findAll(
    query = {},
    page = 1,
    limit = 10,
    populate: PopulateOptions | (string | PopulateOptions)[] = [],
    session: ClientSession | null = null,
  ): Promise<PaginatedResult<T>> {
    this.validateModel();
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.model?.find(query).populate(populate).skip(skip).limit(limit).session(session).lean({ virtuals: true }).exec(),
      this.model?.countDocuments(query).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  protected async updateById(id: ObjectId, updateData: UpdateQuery<T>, session: ClientSession | null = null): Promise<T | null> {
    this.validateModel();
    return this.model
      ?.findByIdAndUpdate(id, updateData, {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      })
      .session(session)
      .exec() as Promise<T | null>;
  }

  protected async updateOne(
    query: FilterQuery<T>,
    updateData: UpdateQuery<T>,
    session: ClientSession | null = null,
  ): Promise<Require_id<FlattenMaps<T>> | null> {
    this.validateModel();
    return this.model
      ?.findOneAndUpdate(query, updateData, {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      })
      .session(session)
      .lean({ virtuals: true })
      .exec() as unknown as Promise<Require_id<FlattenMaps<T>>> | null;
  }

  protected async deleteById(id: ObjectId, session: ClientSession | null = null): Promise<T | null> {
    this.validateModel();
    return this.model?.findByIdAndDelete(id).session(session).exec() as Promise<T | null>;
  }

  protected async deleteOne(query: FilterQuery<T>, session: ClientSession | null = null): Promise<Require_id<FlattenMaps<T>> | null> {
    this.validateModel();
    return this.model?.findOneAndDelete(query).session(session).lean({ virtuals: true }).exec() as unknown as Promise<
      Require_id<FlattenMaps<T>>
    > | null;
  }

  protected async aggregate(pipeline: PipelineStage[], session: ClientSession | null = null): Promise<any[]> {
    this.validateModel();
    return this.model?.aggregate(pipeline).session(session).exec();
  }

  protected async countDocuments(query: FilterQuery<T>, session: ClientSession | null = null): Promise<number> {
    this.validateModel();
    return this.model?.countDocuments(query).session(session).exec() as Promise<number>;
  }

  protected async batchFind(ids: Array<string | ObjectId>, field: string, options?: DbOptions): Promise<T[]> {
    this.validateModel();
    return this.model
      ?.find({ [field]: { $in: ids } } as FilterQuery<T>)
      .session(options?.session || null)
      .exec() as Promise<T[]>;
  }

  protected async batchWrite(operations: any[], session?: ClientSession): Promise<any> {
    this.validateModel();
    return this.model?.bulkWrite(operations, { session });
  }

  protected async startTransaction(connection: Connection): Promise<ClientSession> {
    const session = await connection.startSession();
    session.startTransaction();
    return session;
  }

  protected async commitTransaction(session: ClientSession): Promise<void> {
    await session.commitTransaction();
    session.endSession();
  }

  protected async abortTransaction(session: ClientSession): Promise<void> {
    await session.abortTransaction();
    session.endSession();
  }

  protected buildFindQuery(params: any) {
    const query = {} as GenericAnyType;

    if (!params) return query;

    Object.assign(
      query,
      // Example:
      // Array.isArray(params.Category) && { Category: { $in: params.Category } },
      // params.Description && { Description: new RegExp(params.Description, 'i') },
    );

    return query;
  }
}

export class MongoService<T extends mongoose.Document> extends BaseService<T> {
  constructor(model?: mongoose.Model<T>) {
    super(model);
  }
}

export class MongoApiService<T extends Document> extends MongoService<T> {
  private connection: mongoose.Connection;
  private session: mongoose.ClientSession;
  private client: any;

  constructor(model?: mongoose.Model<T>) {
    super(model);
  }

  /**
   * Initializes the connection and model.
   */
  // async setup(clientName: string) {
  //   this.connection = await MongoDBClient.getConnection(this.uri, clientName);
  //   if (!this.connection) {
  //     throw new Error('Failed to connect to MongoDB');
  //   }

  //   if (!this.model) {
  //     this.model = this.connection.model<T>(this.modelName, this.schema);
  //   }
  //   return this.connection;
  // }

  async setup() {
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

    this.connection = connection;
    this.client = client;
    return this.client;
  }

  async startMongoTransaction() {
    await this.setup();
    const session = await this.startTransaction(this.connection);
    this.session = session;
    return session;
  }

  async commitMongoTransaction() {
    await this.commitTransaction(this.session);
  }

  async abortMongoTransaction() {
    await this.abortTransaction(this.session);
  }

  private createResponse<U>(status: boolean, data: U | null = null, message?: string, error?: any): ServiceResponse<U> {
    if (error) {
      console.error({ error });
    } else {
      console.info({ status, message, data });
    }
    return { status, data, message, error: error || null };
  }

  async createMongo(data: Partial<T>, options?: DbOptions): Promise<ServiceResponse<T | null>> {
    try {
      const result = await this.create(data, options?.session);
      return this.createResponse<T>(!!result, result, 'Record created successfully');
    } catch (error) {
      return this.createResponse(false, null, 'Failed to create record', error);
    }
  }

  async findByIdMongo(id: string, options?: DbOptions): Promise<ServiceResponse<T | null>> {
    try {
      const objectId = new ObjectId(id);
      const data = await this.findById(objectId, options);
      if (!data) {
        return this.createResponse(false, null, 'Record not found');
      }
      return this.createResponse<T>(true, data, 'Record found successfully');
    } catch (error) {
      return this.createResponse(false, null, 'Failed to find record', error);
    }
  }

  async findOneMongo(
    query: FilterQuery<T>,
    queryOptions: QueryOptions,
    options?: DbOptions,
  ): Promise<ServiceResponse<Require_id<FlattenMaps<T>> | null>> {
    try {
      const response = await this.findOne(query, queryOptions, options);
      return this.createResponse<Require_id<FlattenMaps<T>>>(!!response, response, !!response ? 'Record found' : 'Record not found');
    } catch (error) {
      return this.createResponse(false, null, 'Failed to find record', error);
    }
  }

  async findMongo(query: FilterQuery<T>, options?: DbOptions): Promise<ServiceResponse<Require_id<FlattenMaps<T>>[] | null>> {
    try {
      const { data, total, page, limit } = await this.findAll(
        query,
        options?.page || 1,
        options?.limit || 10,
        options?.populate || [],
        options?.session || null,
      );
      if (data.length === 0) {
        return this.createResponse(true, [], 'No records found');
      }
      return {
        ...this.createResponse<Require_id<FlattenMaps<T>>[]>(true, data, 'Records found successfully'),
        total,
        page,
        limit,
      };
    } catch (error) {
      return this.createResponse(false, null, 'Failed to find records', error);
    }
  }

  async updateByIdMongo(id: string, updateData: UpdateQuery<T>, options?: DbOptions): Promise<ServiceResponse<T | null>> {
    try {
      const objectId = new ObjectId(id);
      const response = await this.updateById(objectId, updateData, options?.session);
      return this.createResponse<T>(!!response, response, 'Record updated successfully');
    } catch (error) {
      return this.createResponse(false, null, 'Failed to update record', error);
    }
  }

  async updateOneMongo(
    query: FilterQuery<T>,
    update: UpdateQuery<T>,
    options?: DbOptions,
  ): Promise<ServiceResponse<Require_id<FlattenMaps<T>> | null>> {
    try {
      const response = await this.updateOne(query, update, options?.session);
      return this.createResponse<Require_id<FlattenMaps<T>>>(!!response, response, 'Record updated successfully');
    } catch (error) {
      return this.createResponse(false, null, 'Failed to update record', error);
    }
  }

  async deleteByIdMongo(id: string, options?: DbOptions): Promise<ServiceResponse<T | null>> {
    try {
      const objectId = new ObjectId(id);
      const response = await this.deleteById(objectId, options?.session);
      return this.createResponse<T>(!!response, response, 'Record deleted successfully');
    } catch (error) {
      return this.createResponse(false, null, 'Failed to delete record', error);
    }
  }

  async findInBatch(ids: string[], field: string, options?: DbOptions): Promise<ServiceResponse<T[]>> {
    try {
      const objectIds = ids.map(id => new ObjectId(id));
      const data = await this.batchFind(objectIds, field, options);
      if (data.length === 0) {
        return this.createResponse(true, [], 'No records found');
      }
      return this.createResponse<T[]>(true, data, 'Records found successfully');
    } catch (error) {
      return this.createResponse<T[]>(false, null, 'Failed to find records', error);
    }
  }

  async writeInBatch(data: Partial<T>[], batchSize = 20, options?: DbOptions): Promise<ServiceResponse<T[] | null>> {
    const batchedOperations = [];
    try {
      for (let i = 0; i < data.length; i += batchSize) {
        const batchData: Array<{ insertOne: { document: Partial<T> } }> = data.slice(i, i + batchSize).map(item => ({
          insertOne: { document: item },
        }));
        batchedOperations.push(...batchData);
      }

      const result = await this.batchWrite(batchedOperations, options?.session ? options.session : undefined);
      return this.createResponse<T[]>(true, result, 'Records written successfully');
    } catch (error) {
      return this.createResponse(false, null, 'Failed to write records', error);
    }
  }

  override async startTransaction(connection: Connection): Promise<ClientSession> {
    return super.startTransaction(connection);
  }

  override async commitTransaction(session: ClientSession): Promise<void> {
    return super.commitTransaction(session);
  }

  override async abortTransaction(session: ClientSession): Promise<void> {
    return super.abortTransaction(session);
  }
}

export {
  Connection,
  Model,
  Document,
  FilterQuery,
  UpdateQuery,
  PipelineStage,
  ClientSession,
  PopulateOptions,
  Types,
  ObjectId,
  FlattenMaps,
  Require_id,
  QueryOptions,
  Schema,
};

export const UserMongoService = new MongoApiService<UserDocument>(UserModel);
export const OtpMongoService = new MongoApiService<OtpDocument>(OTPModel);
