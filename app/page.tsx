'use client';

import { useState, useRef, useEffect } from 'react';
import './globals.css';
import { useChatStream } from './api/chat/hooks/useChatStream';
import ReactMarkdown from 'react-markdown'

export default function Home() {
  const { messages, sendMessage } = useChatStream();
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage(input);
    setInput('');
  }

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      await handleSend(e);
    }
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [input]);

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-bubble ${msg.role}`}>
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        ))}
      </div>
      <div className="chat-input">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          rows={1}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}
