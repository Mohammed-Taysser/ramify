import Redis from 'ioredis';

import CONFIG from '@/apps/config';

const redis = new Redis({
  host: CONFIG.REDIS_HOST,
  port: CONFIG.REDIS_PORT,
  maxRetriesPerRequest: null,
});

redis.on('connect', () => {
  console.log('Successfully connected to Redis');
});

redis.on('error', (error) => {
  console.error('Redis connection error:', error);
});

export default redis;
