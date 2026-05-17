import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const DB_URL = process.env.mongodb_url!

export const clearConsole = (): void => {
    console.clear();
};

// Connect to MongoDB
export const connectDB = async (): Promise<void> => {
    try {
        clearConsole();
        console.log('🔄 Connecting to MongoDB...');
        
        await mongoose.connect(DB_URL, {
            serverSelectionTimeoutMS: 5000,
        });
        
        console.log('✅ MongoDB Connected Successfully!');
        console.log(`🕐 Connected at: ${new Date().toLocaleString()}`);
        console.log('━'.repeat(50));
    } catch (error: any) {
        clearConsole();
        console.error('❌ MongoDB Connection Failed!');
        console.error(`Error: ${error.message}`);
    }
};

// Disconnect from MongoDB (for graceful shutdown)
export const disconnectDB = async (): Promise<void> => {
    try {
        await mongoose.disconnect();
        console.log('✅ MongoDB Disconnected Successfully!');
    } catch (error: any) {
        console.error('❌ Error disconnecting from MongoDB:', error.message);
        process.exit(1);
    }
};

export default connectDB;
