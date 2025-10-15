import axios from 'axios';
import { ChatResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:10000/api'; // Ensure this matches your backend port

export const generateQuestion = async (
    userInput: string,
    productId: string | null = null,
    sessionId: string = 'default_session_id' // A simple session ID for now
): Promise<ChatResponse> => {
    try {
        const response = await axios.post<ChatResponse>(`${API_BASE_URL}/generate-question`, {
            userInput,
            productId,
        }, {
            headers: {
                'X-Session-ID': sessionId, // Pass session ID in headers
            }
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error || 'Failed to generate question');
        }
        throw new Error('Network error or unexpected issue');
    }
};

export const getProductReport = async (productId: string) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/products/${productId}`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error || 'Failed to fetch product report');
        }
        throw new Error('Network error or unexpected issue');
    }
};

export const listAllProducts = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/products`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error || 'Failed to list products');
        }
        throw new Error('Network error or unexpected issue');
    }
};