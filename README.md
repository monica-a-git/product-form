
# Product Form Bot

## 📝 Project Overview

The Product Form Bot is an intelligent chatbot designed to streamline the process of gathering comprehensive product information. Users describe their product in natural language, and the bot, powered by the Gemini AI model, asks clarifying questions to populate a detailed product form. 

## 🚀 Setup Instructions

Follow these steps to get your Product Form Bot up and running:

1.  *Clone the Repository (if applicable):*
    bash
    git clone https://github.com/monica-a-git/product-form-altibbe.git
    cd product-form-altibbe
    

2.  *Create and Activate a Virtual Environment (Recommended):*
    bash
    python -m venv venv
    # On Windows:
    .\venv\Scripts\activate
    # On macOS/Linux:
    source venv/bin/activate
    

3.  *Install Dependencies:*
    bash
    pip install Flask google-generativeai requests
    

4.  *Set Up Your Gemini API Key:*
    *   Obtain a Gemini API key from the Google AI Studio or Google Cloud Console.
    *   Set this key as an environment variable named GEMINI_API_KEY.
        *   *On Windows (Command Prompt):*
            bash
            set GEMINI_API_KEY="your_api_key_here"
            
        *   *On Windows (PowerShell):*
            powershell
            $env:GEMINI_API_KEY="your_api_key_here"
            
        *   *On macOS/Linux:*
            bash
            export GEMINI_API_KEY="your_api_key_here"
            
    *   For permanent setup, add this line to your shell's profile file (.bashrc, .zshrc) or system environment variables.

5.  *Enable Generative Language API:*
    *   Ensure the "Generative Language API" is enabled for your Google Cloud Project associated with your API key. If you encounter a 403 error, visit https://console.developers.google.com/apis/api/generativelanguage.googleapis.com/overview and enable it. Wait a few minutes after enabling.

6.  *Run the Flask Backend:*
    bash
    python app.py
    
    The Flask application will start, typically on http://127.0.0.1:5000.

7.  *Access the Frontend:*
    Open your web browser and navigate to http://127.0.0.1:5000.

---

## ✨ Feature List

*   *Intelligent Question Generation:* Utilizes Google's Gemini AI to generate relevant follow-up questions based on user-provided product descriptions.
*   *Conversation Memory:* The bot remembers previous interactions, ensuring contextually aware questions throughout the conversation.
*   *Product Transparency Logic:* Actively guides users to provide detailed information regarding product origin, components, manufacturing, environmental impact, and ethical practices.
*   *Input Feedback & Scoring (Implicit):* Provides subtle feedback on the depth and completeness of the user's previous input, encouraging more descriptive answers.
*   *Single-Turn Combined Response:* Delivers both the generated question and input feedback within a single chat bubble for a streamlined user experience.
*   *User-Friendly Chat Interface:* A simple, intuitive web interface for interacting with the bot.

---

## 🤖 AI Service Documentation (Gemini API)

This project leverages the *Google Gemini API* (specifically the gemini-2.0-flash model via the google-generativeai Python library) for its core natural language understanding and generation capabilities.

*Key Components:*

*   *Model:* gemini-2.0-flash
*   *Endpoint:* Accessed via the google-generativeai Python client library.
*   *Authentication:* Requires an API key (GEMINI_API_KEY) set as an environment variable.
*   *System Instructions:* A detailed system_instruction is provided to the Gemini model at initialization to define its persona as an "expert Product Transparency Bot." This instruction outlines its goals:
    *   Gather comprehensive product form data.
    *   Focus on specific transparency aspects (origin, components, manufacturing, environment, ethics, certifications).
    *   Evaluate previous user input for transparency.
    *   Ask single, concise follow-up questions to improve transparency.
    *   Provide brief feedback on input quality.
*   *Conversation Management:* The model.start_chat(history=...) method is used to maintain a persistent conversation history with the Gemini model, allowing for context-aware responses.
*   *Response Format:* The model is instructed to provide responses in a strict QUESTION | FEEDBACK format, which is then parsed by the Flask backend and displayed on the frontend.

---

## 📦 Sample Product Entry + Example Report

### Sample Product Entry (User Input Sequence):

*User:* "I'm selling a new line of reusable coffee cups."

*Bot:* "Where are the raw materials sourced for your reusable coffee cups? Feedback: 1/10. This is a very basic introduction. We need much more information to assess transparency.?"

*User:* "They are made from recycled stainless steel and a bamboo fiber lid."

*Bot:* "From which specific region or country is the recycled stainless steel sourced? Feedback: 3/10. Good start specifying materials, but we need to know the origin for a complete picture.?"

*User:* "The steel is sourced from industrial scrap in Germany, and the bamboo is sustainably harvested in Vietnam."

*Bot:* "What specific manufacturing processes are used to form the stainless steel and bamboo fiber into the final cup and lid, respectively? Feedback: 6/10. Excellent detail on sourcing. Now let's understand the manufacturing steps involved.?"

*(And so on, guiding the user towards a full transparency profile.)*

### Example Report (Conceptual Output after a full conversation):

*(This would be a summary compiled from all the questions asked and user answers. The bot itself doesn't generate this report, but the questions it asks would build towards collecting this data.)*

*Product Name:* Reusable Coffee Cup (New Line)
*Product Category:* Sustainable Drinkware

*1. Product Materials & Components:*
    *   *Cup Body:* Recycled Stainless Steel
    *   *Lid:* Bamboo Fiber
    *   *Seal (if applicable):* [Question: What material is used for the lid seal? e.g., Food-grade silicone]

*2. Origin & Sourcing:*
    *   *Recycled Stainless Steel:* Industrial scrap, Germany
    *   *Bamboo Fiber:* Sustainably harvested, Vietnam

*3. Manufacturing Process:*
    *   *Location:* [Question: Where are the cups manufactured? e.g., Factory in China]
    *   *Energy Usage:* [Question: Are there details on the energy source or efficiency of the manufacturing plant? e.g., Partially solar-powered]
    *   *Certifications:* [Question: Are there any manufacturing process certifications (e.g., ISO)? e.g., ISO 14001 certified facility]

*4. Environmental Impact:*
    *   *Recyclability:* Cup (100% recyclable), Lid (Compostable)
    *   *Carbon Footprint:* [Question: Has a lifecycle assessment or carbon footprint analysis been performed? e.g., In progress]
    *   *Waste Reduction:* [Question: What efforts are made to minimize waste during production? e.g., Scrap material reuse]

*5. Ethical Practices:*
    *   *Labor Standards:* [Question: Are there any fair labor certifications for the manufacturing facilities? e.g., SA8000 certified]
    *   *Fair Trade:* [Question: Is any part of the supply chain fair trade certified? e.g., Bamboo sourcing adheres to fair trade principles]

*6. Certifications:*
    *   *Product Certifications:* [Question: Does the final product have any eco-labels or safety certifications? e.g., FDA-approved, BPA-free]

---

## 💡 Reflection

### How did you use AI tools in development?

AI tools, primarily Google's Gemini, were central to the development process. Instead of hard-coding decision trees, the Gemini model served as the intelligent core, enabling dynamic and context-aware question generation. I leveraged its natural language understanding capabilities to interpret diverse user product descriptions and its generative abilities to craft relevant, follow-up questions. The system_instruction feature was crucial for "programming" the bot's persona and logic without explicit coding for every scenario. This allowed for rapid prototyping and iteration on the bot's behavior, focusing on prompt engineering to refine its questioning style and transparency-gathering goals. Debugging involved examining API responses and adjusting prompts to steer the model's output more precisely.

### What principles guided your architecture, design, and product transparency logic?

*Architecture & Design:*
The architecture follows a clear *client-server model* with a lightweight Flask backend serving as an API gateway between the frontend (HTML/CSS/JS) and the powerful Gemini AI.
*   *Separation of Concerns:* Frontend handles UI, Flask handles API routing and session management, and model_service.py encapsulates AI interaction. This promotes maintainability and scalability.
*   *Stateless Frontend, Stateful Backend:* The browser remains largely stateless, while the Flask backend manages conversation history using a simple dictionary (which would ideally be a proper session store in production) to provide conversational context to the AI.
*   *API-First Approach:* The generate-question endpoint provides a clean interface for the frontend to interact with the AI logic.

*Product Transparency Logic:*
The transparency logic was guided by a few key principles:
*   *Progressive Disclosure:* Instead of overwhelming the user with a giant form upfront, the bot asks questions incrementally, building the transparency profile step-by-step.
*   *Holistic Transparency:* The system_instruction explicitly defines several categories of transparency (origin, materials, ethics, environment, manufacturing, certifications) to ensure a comprehensive information gathering process. This prevents the bot from getting stuck on just one aspect.
*   *Actionable Feedback:* The bot's feedback mechanism is designed to be concise and constructive, guiding the user on how to improve their next input to enhance transparency, rather than just stating a deficiency.
*   *AI as an Enabler:* The AI's strength in understanding and generating natural language is used to interpret nuanced product descriptions and formulate precise, human-like questions that would be difficult to create with rigid rules-based systems. It allows the bot to "score" (implicitly) and then actively seek to improve that score through its questioning.