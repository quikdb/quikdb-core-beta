import { RedisClientType, RedisModules, RedisFunctions, RedisScripts } from '@redis/client';

export type CustomRedisClientType = RedisClientType<RedisModules, RedisFunctions, RedisScripts>;
