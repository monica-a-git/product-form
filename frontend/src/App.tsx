import React from 'react';
import Chatbot from './components/Chatbot.tsx';
// @ts-ignore
import './App.css'; // Global styles if any

const App: React.FC = () => {
    return (
        <div className="App">
            <Chatbot />
        </div>
    );
};

export default App;