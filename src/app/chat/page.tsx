'use client';

import { useChat } from '@ai-sdk/react';
import { useTheme } from 'next-themes';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  const { theme } = useTheme();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="flex flex-col w-full max-w-2xl py-24 mx-auto stretch px-4">
        <div className="flex-1 space-y-6 mb-12">
          {messages.map(message => (
            <div 
              key={message.id} 
              className={`p-4 rounded-lg whitespace-pre-wrap ${
                message.role === 'user' 
                  ? 'bg-violet-100 dark:bg-violet-900 ml-auto max-w-[80%]' 
                  : 'bg-gray-100 dark:bg-gray-800 mr-auto max-w-[80%]'
              }`}
            >
              <div className="font-semibold mb-2">
                {message.role === 'user' ? 'You' : 'AI'}:
              </div>
              {message.parts.map((part, i) => {
                switch (part.type) {
                  case 'text':
                    return (
                      <div 
                        key={`${message.id}-${i}`}
                        className="text-gray-800 dark:text-gray-200"
                      >
                        {part.text}
                      </div>
                    );
                }
              })}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900">
          <div className="max-w-2xl mx-auto">
            <input
              className="w-full p-4 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              value={input}
              placeholder="Type your message..."
              onChange={handleInputChange}
            />
          </div>
        </form>
      </div>
    </div>
  );
}