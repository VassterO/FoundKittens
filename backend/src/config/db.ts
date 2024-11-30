import mongoose from 'mongoose';
import { logger } from '../utils/logger';

const connectDB = async (): Promise<void> => {
  try {
    // Allow both local and Atlas URIs
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/foundkittens';
    
    logger.info('Attempting to connect to MongoDB...');
    logger.info(`Using database: ${mongoURI.split('@').pop()}`); // Log only the database part, not credentials
    
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });
    
    logger.info('MongoDB Connected Successfully');
    
    // Handle MongoDB events
    mongoose.connection.on('error', (error) => {
      logger.error('MongoDB connection error:', error);
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Attempting to reconnect...');
    });
    
    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });
    
  } catch (error) {
    logger.error('MongoDB Connection Error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      resolution: `
        Please ensure either:
        1. MongoDB is running locally (mongod --dbpath /data/db)
        2. Or set MONGODB_URI in .env to a valid MongoDB Atlas connection string
        
        For local MongoDB:
        - Install MongoDB Community Edition
        - Start the MongoDB service
        - Ensure it's running on port 27017
        
        For MongoDB Atlas:
        - Create a free account at https://www.mongodb.com/cloud/atlas
        - Create a new cluster
        - Add your IP to the whitelist
        - Create a database user
        - Get the connection string and add it to .env
      `
    });
    process.exit(1);
  }
};

export default connectDB;