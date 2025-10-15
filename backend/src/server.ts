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

// --- CRITICAL CORS CONFIGURATION ---
// Get the frontend URL from environment variable for dynamic configuration
// Ensure you set FRONTEND_URL as an environment variable in Render for your backend service
const FRONTEND_URL = process.env.FRONTEND_URL;

if (!FRONTEND_URL) {
    console.error('FRONTEND_URL environment variable is not set. CORS might not be configured correctly.');
    // You might want to throw an error or handle this more gracefully
    // process.exit(1);
}

app.use(cors({
    origin: FRONTEND_URL, // Allow requests ONLY from your specified frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// --- END CORS CONFIGURATION ---


// Render expects your app to listen on process.env.PORT, which it provides
// Default to 5000 for local development if process.env.PORT is not set
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