export interface Message {
    sender: 'user' | 'bot';
    text: string;
}

export interface ProductDetail {
    question: string;
    answer: string;
    transparencyScore: number;
}

export interface Product {
    _id: string;
    initialDescription: string;
    details: ProductDetail[];
    createdAt: string;
    updatedAt: string;
}

export interface ChatResponse {
    question: {
        text: string;
        type: string;
    };
    feedback: string;
    transparencyScore: number;
    productId: string;
    conversationHistory: { role: string; parts: { text: string }[] }[];
}