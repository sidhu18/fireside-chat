import { API_URL, MODEL_NAME } from '@/app/constants';
import { useState, useRef } from 'react';

const ROLE = {
    user: 'user',
    bot: 'bot',
} as const;
  
export type Message = { role: typeof ROLE.user | typeof ROLE.bot; content: string };

export const useChatStream = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesRef = useRef<Message[]>([]);
  messagesRef.current = messages;

  const sendMessage = async (input: string) => {
    if (!input.trim()) return;

    const userMessage: Message = { role: ROLE.user, content: input };
    const newMessages = [...messagesRef.current, userMessage, { role: ROLE.bot, content: '' }];
    setMessages(newMessages);
    messagesRef.current = newMessages;

    const res = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({ 
          model: MODEL_NAME,
          prompt: userMessage.content,
       }),
    });

    if (!res.body) return;

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let botReply = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;

        try {
          const parsed = JSON.parse(line);
          const token = parsed.response || '';

          if (botReply === '' && token.trim() === '') {
            continue;
          }

          botReply += token;

          const updated = [...messagesRef.current];
          updated[updated.length - 1] = { role: 'bot', content: botReply };
          messagesRef.current = updated;
          setMessages(updated);
        } catch (err) {
          console.error('Parse error:', err);
        }
      }
    }
  };

  return { messages, sendMessage };
};
