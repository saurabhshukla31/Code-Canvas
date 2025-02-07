import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Message } from '../types';
import CopyButton from './CopyButton';

interface ChatProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  selectedLang: string;
  onLanguageChange: (lang: string) => void;
  availableLanguages: readonly string[];
}

export function Chat({
  messages,
  isLoading,
  onSendMessage,
  selectedLang,
  onLanguageChange,
  availableLanguages,
}: ChatProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleLangChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onLanguageChange(event.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onSendMessage(suggestion);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full bg-[#101011]">
      <div className="px-6 py-4 border-b border-zinc-800/50 flex justify-between items-center bg-[#171718]">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
            Code
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            
          </p>
        </div>

        <div>
          <select
            className="bg-[#171718] text-zinc-200 border border-zinc-700 rounded-md px-2 py-1"
            value={selectedLang}
            onChange={handleLangChange}
          >
            {availableLanguages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-6 space-y-6 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="text-center mt-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#4387f4]/10 mb-4">
              <Bot className="w-6 h-6 text-blue-500" />
            </div>
            <h2 className="text-lg font-semibold mb-4 text-zinc-100">
              Ready to help with your code
            </h2>
            <p className="text-sm text-zinc-400 mb-6">Try one of these examples:</p>
            <div className="space-y-2 max-w-lg mx-auto">
              {[
                '✨ Explain the Two Sum problem',
                '🔍 How to solve Valid Parentheses?',
                '🚀 Implement Binary Search on a Sorted Array',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full p-3 bg-zinc-800/30 rounded-lg hover:bg-zinc-800/50 border border-zinc-700/50 hover:border-zinc-600/50 transition-all duration-200 group text-sm text-zinc-300 hover:text-zinc-100"
                >
                  <span className="group-hover:translate-x-1 inline-block transition-transform duration-200">
                    {suggestion}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-[#4387f4]/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-5 h-5 text-blue-500" />
                </div>
              )}
              <div
                className={`relative group max-w-[85%] rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-[#4387f4] text-white shadow-xl border border-blue-700'
                    : 'bg-zinc-800/50 text-zinc-100 border border-zinc-700/50'
                }`}
              >
                <div className="p-4 lg:p-5 break-words space-y-4">
                  <ReactMarkdown
                    components={{
                      code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <div className="overflow-x-auto relative">
                            <CopyButton code={String(children).replace(/\n$/, '')} />
                            <SyntaxHighlighter
                              style={{
                                ...oneDark,
                                'pre[class*="language-"]': {
                                  ...oneDark['pre[class*="language-"]'],
                                  background: 'transparent',
                                  padding: '1rem',
                                  borderRadius: '8px',
                                  border: '1px solid #3f3f3f',
                                  marginBottom: '1rem',
                                },
                                'code[class*="language-"]': {
                                  ...oneDark['code[class*="language-"]'],
                                  background: 'transparent',
                                },
                              }}
                              language={match[1]}
                              PreTag="div"
                              className="!rounded-xl custom-scrollbar"
                              customStyle={{
                                fontSize: '0.9rem',
                                lineHeight: 1.5,
                                marginTop: 0,
                                background: 'transparent',
                              }}
                              {...props}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          </div>
                        ) : (
                          <code className="bg-zinc-900/50 text-zinc-200 px-1.5 py-0.5 rounded font-mono text-[0.9em]">
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-zinc-700/30 flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-5 h-5 text-zinc-400" />
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 14px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          margin: 0 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4a4a4a;
          border-radius: 8px;
          border: 2px solid transparent;
          background-clip: padding-box;
          transition: background-color 0.2s;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #666;
          border: 2px solid transparent;
          background-clip: padding-box;
        }

        .custom-scrollbar::-webkit-scrollbar-corner {
          background: transparent;
        }
      `}</style>

      <div className="border-t border-zinc-800/50 px-4 lg:px-6 py-4 bg-[#1a1a1c]">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a coding question..."
              className="flex-1 h-12 text-zinc-100 rounded-xl px-4 border border-zinc-700/50 focus:border-blue-500/50 focus:bg-zinc-800/70 placeholder-zinc-500 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:outline-none bg-[#101011]"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="h-12 px-4 bg-[#4387f4] hover:bg-[#4387f4] text-white rounded-xl disabled:opacity-50 disabled:hover:bg-[#4387f4] transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
