import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }
        await mongoose.connect(mongoUri); // Mongoose uses this URI to connect
        console.log('MongoDB Connected...');
    } catch (err: any) {
        console.error(err.message);
        process.exit(1);
    }
};

export default connectDB;