import NodeCache from 'node-cache';

// TTL (time-to-live) of 48 hour
const cache = new NodeCache({ stdTTL: 3600 * 48 });

export const AddToBlacklist = (token: string, exp: number = Math.floor(Date.now() / 1000) + 3600 * 48): void => {
  const ttl = exp - Math.floor(Date.now() / 1000);
  cache.set(token, true, ttl);
};

export const IsTokenBlacklisted = (token: string): boolean => {
  return cache.get(token) !== undefined;
};
