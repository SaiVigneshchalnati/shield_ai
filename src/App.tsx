import React, { useState, useRef, useEffect } from 'react';
import { Shield, Send, Bot, User, ShieldEllipsis } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';

// Initialize Gemini AI with the correct API version
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(userMessage);
      const response = await result.response;
      const text = response.text();

      setMessages(prev => [...prev, { role: 'assistant', content: text }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I apologize, but I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-2">
          <Shield className="h-8 w-8 text-white hover-scale" />
          <h1 className="text-2xl font-bold">Shield AI</h1>
        </div>
      </header>

      {/* Chat Container */}
      <main className="max-w-4xl mx-auto p-4">
        <div className="bg-zinc-900 rounded-lg border border-zinc-800 min-h-[600px] flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-zinc-400">
                <Bot className="h-16 w-16 mb-4 hover-scale" />
                <p className="text-lg">How can I assist you today?</p>
              </div>
            )}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 mb-4 message-animation ${
                  message.role === 'assistant' ? 'flex-row' : 'flex-row-reverse'
                }`}
              >
                <div className={`flex-shrink-0 ${
                  message.role === 'assistant' ? 'text-white' : 'text-zinc-300'
                }`}>
                  {message.role === 'assistant' ? (
                    <Bot className="h-8 w-8 hover-scale" />
                  ) : (
                    <User className="h-8 w-8 hover-scale" />
                  )}
                </div>
                <div
                  className={`rounded-lg p-4 max-w-[80%] hover-scale ${
                    message.role === 'assistant'
                      ? 'bg-zinc-800 text-white'
                      : 'bg-white text-black'
                  }`}
                >
                  <ReactMarkdown className="prose prose-invert text-gray-400 font-semibold">
                    {message.content}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 mb-4 message-animation">
                <Bot className="h-8 w-8 text-white hover-scale" />
                <div className="bg-zinc-800 rounded-lg p-4">
                  <ShieldEllipsis className="h-6 w-6 animate-spin text-white typing-indicator" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="border-t border-zinc-800 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-2 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-white text-black rounded-lg px-4 py-2 hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover-scale transition-colors"
              >
                <Send className="h-5 w-5" />
                Send
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default App;