import dotenv from 'dotenv';

dotenv.config();

import app from './app.js';
import { connectDatabase } from './config/db.js';
import { connectRedis } from './config/redis.js';

const port = Number(process.env.PORT || 5000);

const start = async () => {
  await connectDatabase();
  await connectRedis();

  app.listen(port, () => {
    console.log(`Backend listening on port ${port}`);
  });
};

start().catch((error) => {
  console.error('Failed to start backend', error);
  process.exit(1);
});

