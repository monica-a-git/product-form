import React, { useState, useEffect, useRef } from 'react';
import MessageComponent from './Message.tsx';
import { Message, Product, ChatResponse } from '../types';
import { generateQuestion, getProductReport, listAllProducts } from '../api/chat.ts';
// @ts-ignore
import './Chatbot.css'; // Create this CSS file

const Chatbot: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        { sender: 'bot', text: "Hello! Describe your product, and I'll generate some questions for your form. What are you selling?" }
    ]);
    const [userInput, setUserInput] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [currentProductId, setCurrentProductId] = useState<string | null>(null);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        // Load existing products on component mount
        const fetchProducts = async () => {
            try {
                const products = await listAllProducts();
                setAllProducts(products);
            } catch (err: any) {
                setError(err.message);
            }
        };
        fetchProducts();
    }, []);

    const sendMessage = async () => {
        const userText = userInput.trim();
        if (userText === '') return;

        // Add user message to UI
        setMessages((prevMessages) => [...prevMessages, { sender: 'user', text: userText }]);
        setUserInput('');
        setIsLoading(true);
        setError(null);

        try {
            const response: ChatResponse = await generateQuestion(userText, currentProductId);

            setMessages((prevMessages) => [...prevMessages, { sender: 'bot', text: response.question.text }]);
            setCurrentProductId(response.productId); // Update current product ID

            // Optionally, update the local list of products (for immediate display)
            // You might want to refetch all products or update a specific one
            // For now, let's just refetch all to keep it simple.
            const updatedProducts = await listAllProducts();
            setAllProducts(updatedProducts);

        } catch (err: any) {
            setError(err.message);
            setMessages((prevMessages) => [...prevMessages, { sender: 'bot', text: `Oops! Something went wrong: ${err.message}. Please try again.` }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !isLoading) {
            sendMessage();
        }
    };

    const viewProductReport = async (productId: string) => {
        setIsLoading(true);
        setError(null);
        try {
            // When calling getProductReport, expect a PDF blob, not JSON
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/products/${productId}`);

            if (!response.ok) {
                const errorText = await response.text(); // Get raw error text
                throw new Error(`Failed to fetch report: ${errorText}`);
            }

            const blob = await response.blob(); // Get the response as a Blob (binary data)

            // Create a temporary URL for the blob
            const url = window.URL.createObjectURL(blob);

            // Create a temporary link element
            const a = document.createElement('a');
            a.href = url;
            a.download = `ProductReport-${productId}.pdf`; // Suggest a filename
            document.body.appendChild(a); // Append to body (required for Firefox)
            a.click(); // Programmatically click the link to trigger download

            // Clean up: remove the link and revoke the URL
            a.remove();
            window.URL.revokeObjectURL(url);

        } catch (err: any) {
            console.error('Error fetching PDF report:', err);
            setError(`Error generating PDF report: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const loadExistingProduct = async (product: Product) => {
        setCurrentProductId(product._id);
        // Clear existing chat and load product's chat history
        const initialBotMessage = { sender: 'bot', text: "Hello! Describe your product, and I'll generate some questions for your form. What are you selling?" };
        let newMessages: Message[] = [initialBotMessage, { sender: 'user', text: product.initialDescription }];

        for (const detail of product.details) {
            // Reconstruct the bot's question and the user's answer
            newMessages.push({ sender: 'bot', text: detail.question });
            newMessages.push({ sender: 'user', text: detail.answer });
        }
        setMessages(newMessages);

        // Fetch the next question for this loaded product
        // This will effectively continue the conversation from where it left off.
        setIsLoading(true);
        setError(null);
        try {
             // Pass an empty string as userInput to just trigger the next question generation
             // The backend will use the stored history for the specific product ID.
            const response: ChatResponse = await generateQuestion("", product._id);
            setMessages((prevMessages) => [...prevMessages, { sender: 'bot', text: response.question.text }]);
            // No need to update currentProductId as it's already set
        } catch (err: any) {
            setError(err.message);
            setMessages((prevMessages) => [...prevMessages, { sender: 'bot', text: `Oops! Something went wrong loading: ${err.message}. Please try again.` }]);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="chatbot-container">
            <div className="product-list-panel">
                <h3>Existing Products</h3>
                <ul>
                    {allProducts.map((product) => (
                        <li key={product._id}>
                            <button onClick={() => loadExistingProduct(product)}>{product.initialDescription}</button>
                            <button className="report-btn" onClick={() => viewProductReport(product._id)}>View Report</button>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="chat-panel">
                <div className="chatbot-header">
                    <h2>Product Form Bot</h2>
                    {currentProductId && <p className="current-product-id">Product ID: {currentProductId}</p>}
                </div>
                <div className="chatbot-messages">
                    {messages.map((msg, index) => (
                        <MessageComponent key={index} message={msg} />
                    ))}
                    {isLoading && <MessageComponent message={{ sender: 'bot', text: 'Generating question...' }} />}
                    <div ref={messagesEndRef} />
                </div>
                <div className="chatbot-input">
                    <input
                        type="text"
                        id="userInput"
                        placeholder="Type your product description/answer here..."
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                    />
                    <button id="sendBtn" onClick={sendMessage} disabled={isLoading}>
                        Send
                    </button>
                </div>
                {error && <div className="error-message" style={{ display: 'block' }}>{error}</div>}
            </div>
        </div>
    );
};

export default Chatbot;