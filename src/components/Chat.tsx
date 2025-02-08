import React, { useState, useRef } from 'react';
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
  const inputRef = useRef<HTMLInputElement>(null);

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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 sm:px-6 py-2 sm:py-3 border-b border-zinc-800/50 flex justify-between items-center bg-[#171718] sticky top-0 z-10">
        <div>
          <h2 className="text-base sm:text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
            Code
          </h2>
        </div>

        <select
          className="bg-[#171718] text-zinc-200 text-xs sm:text-sm border border-zinc-700 rounded-md px-2 py-1 sm:py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-2 sm:px-6 py-2 sm:py-4 space-y-2 sm:space-y-4 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="text-center mt-2 sm:mt-8 px-2 sm:px-4">
            <div className="inline-flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-[#4387f4]/10 mb-2 sm:mb-4">
              <Bot className="w-4 h-4 sm:w-6 sm:h-6 text-blue-500" />
            </div>
            <h2 className="text-sm sm:text-lg font-semibold mb-2 sm:mb-4 text-zinc-100">
              Ready to help with your code
            </h2>
            <p className="text-2xs sm:text-sm text-zinc-400 mb-3 sm:mb-6">Try one of these examples:</p>
            <div className="space-y-1.5 sm:space-y-2 max-w-lg mx-auto px-2 sm:px-4">
              {[
                '✨ Explain the Two Sum problem',
                '🔍 How to solve Valid Parentheses?',
                '🚀 Implement Binary Search on a Sorted Array',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full p-2 sm:p-3 bg-zinc-800/30 rounded-md sm:rounded-lg hover:bg-zinc-800/50 border border-zinc-700/50 hover:border-zinc-600/50 transition-all duration-200 group text-2xs sm:text-sm text-zinc-300 hover:text-zinc-100"
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
              className={`flex items-start gap-1.5 sm:gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-md sm:rounded-lg bg-[#4387f4]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-3 h-3 sm:w-5 sm:h-5 text-blue-500" />
                </div>
              )}
              <div
                className={`relative group max-w-[92%] sm:max-w-[70%] rounded-lg sm:rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-[#4387f4] text-white shadow-md sm:shadow-xl border border-blue-700'
                    : 'bg-zinc-800/50 text-zinc-100 border border-zinc-700/50'
                }`}
              >
                <div className="p-2 sm:p-3 break-words space-y-2 sm:space-y-4 text-xs sm:text-sm">
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
                                  padding: '0.5rem',
                                  borderRadius: '4px',
                                  border: '1px solid #3f3f3f',
                                  marginBottom: '0.5rem',
                                  fontSize: '0.7rem',
                                  '@media (min-width: 640px)': {
                                    padding: '0.75rem',
                                    fontSize: '0.85rem',
                                    borderRadius: '6px',
                                    marginBottom: '0.75rem',
                                  },
                                },
                                'code[class*="language-"]': {
                                  ...oneDark['code[class*="language-"]'],
                                  background: 'transparent',
                                },
                              }}
                              language={match[1]}
                              PreTag="div"
                              className="!rounded-md sm:!rounded-xl custom-scrollbar text-2xs sm:text-sm"
                              customStyle={{
                                lineHeight: 1.4,
                                marginTop: 0,
                                background: 'transparent',
                              }}
                              {...props}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          </div>
                        ) : (
                          <code className="bg-zinc-900/50 text-zinc-200 px-1 py-0.5 rounded text-[0.75em] sm:text-[0.85em]">
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
                <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-md sm:rounded-lg bg-zinc-700/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-3 h-3 sm:w-5 sm:h-5 text-zinc-400" />
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Input Form */}
      <div className="border-t border-zinc-800/50 p-2 sm:px-4 sm:py-3 bg-[#1a1a1c] sticky bottom-0">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="flex items-center gap-1.5 sm:gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a coding question..."
              className="flex-1 h-9 sm:h-10 text-xs sm:text-base text-zinc-100 rounded-md sm:rounded-xl px-2.5 sm:px-4 border border-zinc-700/50 focus:border-blue-500/50 focus:bg-zinc-800/70 placeholder-zinc-500 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:outline-none bg-[#101011]"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="h-9 sm:h-10 px-2.5 sm:px-4 bg-[#4387f4] hover:bg-[#4387f4]/90 text-white rounded-md sm:rounded-xl disabled:opacity-50 disabled:hover:bg-[#4387f4] transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
              ) : (
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }

        @media (min-width: 640px) {
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
            height: 8px;
          }
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          margin: 0 2px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4a4a4a;
          border-radius: 8px;
          border: 1px solid transparent;
          background-clip: padding-box;
          transition: background-color 0.2s;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #666;
          border: 1px solid transparent;
          background-clip: padding-box;
        }

        .custom-scrollbar::-webkit-scrollbar-corner {
          background: transparent;
        }
      `}</style>
    </div>
  );
}
