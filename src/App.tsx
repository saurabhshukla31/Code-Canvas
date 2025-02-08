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
      <img src="data:image/svg+xml,%3Csvg width='28' height='28' viewBox='0 0 28 28' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M14 28C14 26.0633 13.6267 24.2433 12.88 22.54C12.1567 20.8367 11.165 19.355 9.905 18.095C8.645 16.835 7.16333 15.8433 5.46 15.12C3.75667 14.3733 1.93667 14 0 14C1.93667 14 3.75667 13.6383 5.46 12.915C7.16333 12.1683 8.645 11.165 9.905 9.905C11.165 8.645 12.1567 7.16333 12.88 5.46C13.6267 3.75667 14 1.93667 14 0C14 1.93667 14.3617 3.75667 15.085 5.46C15.8317 7.16333 16.835 8.645 18.095 9.905C19.355 11.165 20.8367 12.1683 22.54 12.915C24.2433 13.6383 26.0633 14 28 14C26.0633 14 24.2433 14.3733 22.54 15.12C20.8367 15.8433 19.355 16.835 18.095 18.095C16.835 19.355 15.8317 20.8367 15.085 22.54C14.3617 24.2433 14 26.0633 14 28Z' fill='url(%23paint0_radial)'/%3E%3Cdefs%3E%3CradialGradient id='paint0_radial' cx='0' cy='0' r='1' gradientUnits='userSpaceOnUse' gradientTransform='translate(2.77876 11.3795) rotate(18.6832) scale(29.8025 238.737)'%3E%3Cstop offset='0.0671246' stop-color='%239168C0'/%3E%3Cstop offset='0.342551' stop-color='%235684D1'/%3E%3Cstop offset='0.672076' stop-color='%231BA1E3'/%3E%3C/radialGradient%3E%3C/defs%3E%3C/svg%3E" alt="Gemini Logo" className="w-9 h-9" />
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
