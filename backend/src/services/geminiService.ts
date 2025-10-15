import { GoogleGenerativeAI, GenerativeModel, ChatSession } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable is not set.");
}

const systemInstructions = `You are an expert product assistant. Your goal is to gather detailed information about a product to build a comprehensive data.
Always ask a single, concise, clarifying question relevant to the previous statements and the overall product description.
Each interaction should aim to gather more information related to a product's origin, components, manufacturing, environmental impact, and ethical practices.
Consider the following aspects for transparency:
- **Origin & Sourcing:** Where do raw materials come from? (e.g., country, specific region)
- **Ingredients & Components:** Full disclosure of materials used, key components.
- **Manufacturing Process:** How and where is it made? Conditions, energy usage.
- **Environmental Impact:** Recyclability, carbon footprint, sustainability initiatives.
- **Ethical Practices:** Labor standards, fair trade, certifications.
- **Certifications:** Any relevant industry or ethical certifications.
For each user input, you will:
1. **Evaluate the previous description/answer** for its level of transparency based on the above aspects. 
   Identify which transparency aspects are well-covered and which are lacking or vague.
2. **Ask a single, concise follow-up question** that directly seeks to improve the transparency score. 
3. **Provide very brief feedback** (1-2 sentences) on the overall transparency level of the *previous* user input. 
   Encourage more detail on specific areas if needed, or acknowledge good transparency where it exists.
Format your output as: 'Question: [Your question]? Feedback: [Transparency feedback score from 1-10 and brief text]' 
Example: 'Question: Where are the raw materials for this product sourced from? Feedback: 5 - Needs more detail on origin.' 
Avoid using asterisks or any other markdown formatting beyond the specified 'Question: ...? Feedback: ...' structure.`;

const genAI = new GoogleGenerativeAI(API_KEY);
const model: GenerativeModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash', systemInstruction: systemInstructions });


interface GeminiResponse {
    question: string;
    feedback: string;
    transparencyScore: number;
}

export const generateQuestionWithContext = async (
    userInput: string,
    conversationHistory: { role: string; parts: { text: string }[] }[]
): Promise<{ geminiResponse: GeminiResponse; updatedHistory: { role: string; parts: { text: string }[] }[] }> => {
    const chat: ChatSession = model.startChat({
        history: conversationHistory,
        // The system instructions are set at the model initialization level
        // For Gemini 2.0-flash, system_instruction is passed to the model directly.
        // If your model doesn't support it or if you want to apply per-chat,
        // you might prepend it to the first message or rely on history context.
    });

    try {
        const fullResponse = await chat.sendMessage(userInput);
        const generatedText = fullResponse.response.text().trim();

        // Parse the response based on the new format
        const questionMatch = generatedText.match(/Question:\s*(.*?)\?/);
        const feedbackMatch = generatedText.match(/Feedback:\s*(\d+)\s*-\s*(.*)/);

        let question = "Could you please provide more details?";
        let feedback = "No specific feedback.";
        let transparencyScore = 0;

        if (questionMatch && questionMatch[1]) {
            question = questionMatch[1].trim() + "?";
        }
        if (feedbackMatch) {
            transparencyScore = parseInt(feedbackMatch[1], 10);
            feedback = feedbackMatch[2].trim();
        }

        const geminiResponse: GeminiResponse = {
            question,
            feedback,
            transparencyScore,
        };

        // Manually construct the updated history
        const updatedHistory = [...conversationHistory, { role: 'model', parts: [{ text: generatedText }] }];
        return { geminiResponse, updatedHistory };

    } catch (e: any) {
        console.error("Error calling Gemini API:", e);
        if (e.response && e.response.prompt_feedback && e.response.prompt_feedback.safety_ratings) {
            throw new Error(`Gemini API content blocked due to safety reasons: ${JSON.stringify(e.response.prompt_feedback.safety_ratings)}`);
        }
        throw new Error(`Gemini API error: ${e.message || e}`);
    }
};