// src/utils/redisClient.js
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');
export default {
  get: (k) => redis.get(k),
  setex: (k, ttl, v) => redis.setex(k, ttl, v),
  del: (k) => redis.del(k),
  client: redis,
};
