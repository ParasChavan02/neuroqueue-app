import Redis from 'ioredis';

const redisHost = process.env.REDIS_HOST || 'redis';
const redisPort = parseInt(process.env.REDIS_PORT || '6379');
const redisPassword = process.env.REDIS_PASSWORD || '';

let redisConfig = {
  host: redisHost,
  port: redisPort,
};

if (redisPassword) {
  redisConfig = {
    ...redisConfig,
    password: redisPassword,
    tls: {},
    enableReadyCheck: false,
    enableOfflineQueue: false,
  };
  console.log('[Redis] Connecting with TLS (Upstash production)');
} else {
  console.log('[Redis] Connecting without TLS (local setup)');
}

let redis;

export const connectRedis = async () => {
  redis = new Redis(redisConfig);

  redis.on('connect', () => {
    console.log('[Redis] Connected successfully');
  });

  redis.on('error', (err) => {
    console.error('[Redis] Connection error:', err.message);
  });

  redis.on('close', () => {
    console.log('[Redis] Connection closed');
  });

  return redis;
};

export const getRedis = () => {
  if (!redis) {
    throw new Error('Redis has not been initialized. Call connectRedis() first.');
  }
  return redis;
};
