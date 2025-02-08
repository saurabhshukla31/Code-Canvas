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
      <img src="https://upload.wikimedia.org/wikipedia/commons/0/0f/Google_Gemini_Logo.svg" alt="Gemini Logo" className="w-9 h-9" />
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
      className="flex items-center gap-2 text-white transition-all duration-300 
      sm:px-4 sm:py-2 sm:bg-white/10 sm:hover:bg-white/20 sm:border sm:border-white/20 
      sm:rounded-lg sm:shadow-md sm:hover:shadow-lg"
    >
      {/* GitHub Icon (Always Visible) */}
      <Github className="w-4 h-4 md:w-3.5 md:h-3.5" />
      {/* "Star on GitHub" Text (Hidden on Mobile, Visible on Larger Screens) */}
      <span className="hidden sm:block text-xs md:text-sm font-semibold">Star on GitHub</span>
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
