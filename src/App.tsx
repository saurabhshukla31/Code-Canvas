import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Chat } from './components/Chat';
import { Canvas } from './components/Canvas';
import type { Message, ChatState } from './types';
import { Bot, Github } from 'lucide-react';
import { generateResponse } from './lib/gemini';

const AVAILABLE_LANGUAGES = ['Python', 'C', 'C++', 'Java', 'JavaScript'] as const;
type ProgrammingLanguage = typeof AVAILABLE_LANGUAGES[number];

const MetaViewport = () => (
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
);

const Header = React.memo(() => (
  <header className="h-14 sticky top-0 z-50 bg-white/10 backdrop-blur-xl border-b border-zinc-800/30 flex items-center justify-between px-4 md:px-6 shadow-lg">
    <div className="flex items-center gap-3 md:gap-4">
      <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-white/20 shadow-sm">
        <Bot className="w-5 h-5 text-blue-400 drop-shadow-sm" />
      </div>
      <a
        href="https://ai-code-canvas.vercel.app/"
        rel="noopener noreferrer"
        className="text-base sm:text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-[#FFFFFF]"
      >
        CodeCanvas
      </a>
    </div>

    <a
      href="https://github.com/saurabhshukla31/Code-Canvas"
      target="_blank"
      rel="noopener noreferrer"
      className="px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-semibold rounded-lg 
      bg-white/10 hover:bg-white/20 
      border border-white/20 
      text-white 
      transition-all duration-300 
      flex items-center gap-2 
      backdrop-blur-sm 
      shadow-md hover:shadow-lg"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        className="w-5 h-5"
      >
        <path 
          fillRule="evenodd" 
          d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.167 6.839 9.49.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.704-2.782.603-3.369-1.34-3.369-1.34-.455-1.157-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.089 2.91.832.091-.647.349-1.088.635-1.34-2.22-.253-4.555-1.11-4.555-4.946 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.272.098-2.65 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0 1 12 6.801c.85.004 1.705.114 2.505.335 1.91-1.294 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.699 1.028 1.592 1.028 2.683 0 3.846-2.339 4.69-4.566 4.938.359.309.678.921.678 1.856 0 1.34-.012 2.418-.012 2.746 0 .268.18.578.688.481C19.135 20.163 22 16.417 22 12c0-5.523-4.477-10-10-10z" 
          clipRule="evenodd"
        />
      </svg>
      <span className="hidden sm:block">Star on GitHub</span>
    </a>
  </header>
));

Header.displayName = 'Header';

export default function App() {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
  });
  const [selectedLang, setSelectedLang] = useState<ProgrammingLanguage>('Python');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatState.messages]);

  const handleSendMessage = useCallback(async (message: string) => {
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, { role: 'user', content: message }],
      isLoading: true,
    }));
    try {
      const responseText = await generateResponse(message, selectedLang);
      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, { role: 'assistant', content: responseText }],
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error:', error);
      setChatState(prev => ({
        ...prev,
        messages: [
          ...prev.messages,
          { role: 'assistant', content: 'Error processing request. Please try again.' },
        ],
        isLoading: false,
      }));
    }
  }, [selectedLang]);

  const latestAssistantMessage = useMemo(() =>
    chatState.messages.filter(m => m.role === 'assistant').slice(-1)[0]?.content,
    [chatState.messages]
  );

  return (
    <>
      <MetaViewport />
      <div className="h-screen bg-[#000000] text-zinc-100 flex flex-col">
        <Header />
        <main className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-2 md:p-4 overflow-hidden">
          {/* Chat Section */}
          <div className="border border-zinc-800/50 rounded-lg bg-zinc-900/20 overflow-hidden flex flex-col">
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto">
              <Chat
                messages={chatState.messages}
                isLoading={chatState.isLoading}
                onSendMessage={handleSendMessage}
                selectedLang={selectedLang}
                onLanguageChange={setSelectedLang}
                availableLanguages={AVAILABLE_LANGUAGES}
              />
            </div>
          </div>
          {/* Canvas Section */}
          <div className="hidden md:block border border-zinc-800/50 rounded-lg bg-zinc-900/20 overflow-hidden">
            <Canvas latestMessage={latestAssistantMessage} />
          </div>
        </main>
      </div>
    </>
  );
}
