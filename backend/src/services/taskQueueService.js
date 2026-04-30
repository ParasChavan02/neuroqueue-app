import { getRedis } from '../config/redis.js';

const queueName = process.env.QUEUE_NAME || 'task_queue';

export const enqueueTask = async (taskId) => {
  const redis = getRedis();
  await redis.rpush(queueName, JSON.stringify({ taskId }));
};

