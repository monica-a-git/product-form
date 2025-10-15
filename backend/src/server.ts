import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db';
import chatRoutes from './routers/chatRoutes';
import productRoutes from './routers/productRoutes';

dotenv.config();

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(express.json()); // For parsing application/json
app.use(cors()); // Enable CORS for all routes

const PORT = process.env.PORT || 5000;

// Define Routes
app.use('/api', chatRoutes);
app.use('/api', productRoutes); // For product listing and reports

// Simple health check endpoint
app.get('/', (req, res) => {
    res.send('API is running...');
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});