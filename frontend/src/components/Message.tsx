import React from 'react';
import { Message } from '../types';
// @ts-ignore
import '..//components//Message.css'; // Create this CSS file

interface MessageProps {
    message: Message;
}

const MessageComponent: React.FC<MessageProps> = ({ message }) => {
    return (
        <div className={`message ${message.sender}-message`}>
            <p>{message.text}</p>
        </div>
    );
};

export default MessageComponent;