import mongoose from 'mongoose';

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  throw new Error('MONGO_URI is required in environment variables');
}

export const connectDatabase = async () => {
  try {
    mongoose.set('strictQuery', true);

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log('[MongoDB] Connected successfully to:', mongoUri.replace(/:[^:]*@/, ':***@'));

    mongoose.connection.on('error', (err) => {
      console.error('[MongoDB] Runtime error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('[MongoDB] Connection closed');
    });

    return mongoose;
  } catch (err) {
    console.error('[MongoDB] Connection failed:', err.message);
    process.exit(1);
  }
};

