import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db';
import chatRoutes from './routers/chatRoutes';
import productRoutes from './routers/productRoutes';

dotenv.config();

const app = express();

connectDB();

app.use(express.json());

const FRONTEND_URL = process.env.FRONTEND_URL;

if (!FRONTEND_URL) {
    console.error('FRONTEND_URL environment variable is not set. CORS might not be configured correctly.');
}

app.use(cors({
    origin: FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-ID', 'x-session-id'] // <--- ADD THESE
}));

const PORT = process.env.PORT || 5000;

app.use('/api', chatRoutes);
app.use('/api', productRoutes);

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});