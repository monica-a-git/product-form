import { Request, Response } from 'express';
import Product, { IProduct } from '../models/Product';
import { generateQuestionWithContext } from '../services/geminiService';

// Store conversation histories temporarily (in-memory, for production use a persistent store like Redis)
interface ConversationSession {
    history: { role: string; parts: { text: string }[] }[];
    productId: string | null; // To link chat to a specific product document
    initialDescription: string | null;
}
const conversationSessions: { [sessionId: string]: ConversationSession } = {};

// Helper to extract session ID (can be expanded for proper user sessions)
const getSessionId = (req: Request): string => {
    // For simplicity, we'll use a fixed ID or derive from headers/cookies if implemented
    // In a real app, use user authentication token or Flask-like session management
    return req.headers['x-session-id'] as string || 'default_user_session';
};

export const generateQuestion = async (req: Request, res: Response) => {
    const { userInput, productId } = req.body;
    const sessionId = getSessionId(req);

    if (!userInput) {
        return res.status(400).json({ error: 'User input (product description/answer) is required' });
    }

    // Initialize or retrieve session state
    if (!conversationSessions[sessionId]) {
        conversationSessions[sessionId] = { history: [], productId: null, initialDescription: null };
    }
    const session = conversationSessions[sessionId];

    let currentProduct: IProduct | null = null;

    try {
        // If a productId is provided, try to load it and its chat history
        if (productId && !session.productId) {
            currentProduct = await Product.findById(productId);
            if (currentProduct) {
                session.productId = productId;
                session.initialDescription = currentProduct.initialDescription;
                // Reconstruct history from stored product details
                session.history = [{ role: 'user', parts: [{ text: currentProduct.initialDescription }] }];
                for (const detail of currentProduct.details) {
                    session.history.push({ role: 'model', parts: [{ text: `Question: ${detail.question} Feedback: ${detail.transparencyScore} - ${detail.answer}` }] }); // Assuming Gemini's previous response format
                    session.history.push({ role: 'user', parts: [{ text: detail.answer }] });
                }
            }
        }

        // Add user's latest input to history before calling Gemini
        session.history.push({ role: 'user', parts: [{ text: userInput }] });

        // Call Gemini service
        const { geminiResponse, updatedHistory } = await generateQuestionWithContext(userInput, session.history);
        session.history = updatedHistory; // Update session history with Gemini's response

        let currentQuestion = geminiResponse.question;
        let currentFeedback = geminiResponse.feedback;
        let currentScore = geminiResponse.transparencyScore;

        // If this is the initial description, create a new product document
        if (!session.productId && !currentProduct) {
            currentProduct = new Product({
                initialDescription: userInput,
                details: [
                    // For the very first interaction, the 'userInput' is the initial description.
                    // The 'question' and 'feedback' from Gemini are for the *next* piece of info.
                    // We'll store the first "detail" as the user's initial description and Gemini's first question/feedback.
                    // Or, we can choose to only store Q&A pairs *after* the initial description.
                    // For simplicity, let's assume the first 'userInput' IS the initial description,
                    // and subsequent 'userInput's are answers to previous questions.
                ]
            });
            await currentProduct.save();
            session.productId = (currentProduct._id as any).toString();
            session.initialDescription = userInput;
        } else if (session.productId && session.initialDescription) {
            // If continuing an existing product, save the Q&A pair
            currentProduct = await Product.findById(session.productId);
            if (currentProduct) {
                // The previous question would be the last model message in history,
                // and the current userInput is the answer to that question.
                const lastModelMessage = session.history[session.history.length - 2]; // User, then Model (question)
                let prevQuestion = "N/A";
                let prevScore = 0;
                if (lastModelMessage && lastModelMessage.role === 'model' && lastModelMessage.parts.length > 0) {
                    const matchQ = lastModelMessage.parts[0].text.match(/Question:\s*(.*?)\?/);
                    if (matchQ) prevQuestion = matchQ[1].trim() + "?";

                    const matchF = lastModelMessage.parts[0].text.match(/Feedback:\s*(\d+)/);
                    if (matchF) prevScore = parseInt(matchF[1], 10);
                }

                currentProduct.details.push({
                    question: prevQuestion, // This is the question Gemini asked *before* the current userInput
                    answer: userInput, // This is the user's answer to prevQuestion
                    transparencyScore: prevScore, // This is the score Gemini gave for the prev answer
                });
                currentProduct.updatedAt = new Date();
                await currentProduct.save();
            }
        }

        res.json({
            question: {
                text: currentQuestion,
                type: 'text'
            },
            feedback: currentFeedback,
            transparencyScore: currentScore,
            productId: session.productId,
            conversationHistory: session.history // Send back the updated history
        });

    } catch (error: any) {
        console.error('Error in generateQuestion:', error);
        res.status(500).json({ error: error.message || 'An internal server error occurred' });
    }
};

export const getProductReport = async (req: Request, res: Response) => {
    try {
        const { productId } = req.params;
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(product);
    } catch (error: any) {
        console.error('Error fetching product report:', error);
        res.status(500).json({ error: error.message || 'An internal server error occurred' });
    }
};

export const listProducts = async (req: Request, res: Response) => {
    try {
        const products = await Product.find().sort({ updatedAt: -1 });
        res.json(products);
    } catch (error: any) {
        console.error('Error listing products:', error);
        res.status(500).json({ error: error.message || 'An internal server error occurred' });
    }
};