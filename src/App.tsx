import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Chat } from './components/Chat';
import { Canvas } from './components/Canvas';
import type { Message, ChatState } from './types';
import { Bot, Github } from 'lucide-react';
import { generateResponse } from './lib/gemini';

const AVAILABLE_LANGUAGES = ['Python', 'C', 'C++', 'Java', 'JavaScript'] as const;
type ProgrammingLanguage = typeof AVAILABLE_LANGUAGES[number];

const Header = React.memo(() => (
  <header className="h-16 sticky top-0 z-50 bg-white/10 backdrop-blur-xl border-b border-zinc-800/30 flex items-center justify-between px-6 shadow-lg">
    <div className="flex items-center gap-4">
      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-white/20 shadow-sm">
        <Bot className="w-6 h-6 text-blue-400 drop-shadow-sm" />
      </div>
      <h1 className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
        CodeCanvas
      </h1>
    </div>
    <a
      href="https://github.com/saurabhshukla31/Code-Canvas"
      target="_blank"
      rel="noopener noreferrer"
      className="px-4 py-2 text-sm font-semibold rounded-lg 
      bg-white/10 hover:bg-white/20 
      border border-white/20 
      text-white 
      transition-all duration-300 
      flex items-center gap-2 
      backdrop-blur-sm 
      shadow-md hover:shadow-lg"
    >
      <Github className="w-4 h-4" />
      Star on GitHub
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
    <div className="h-screen bg-[#0A0A0B] text-zinc-100 flex flex-col">
      <Header />
      <main className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 overflow-hidden">
        {/* Chat Section */}
        <div className="border border-zinc-800/50 rounded-lg bg-zinc-900/20 overflow-hidden flex flex-col">
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4">
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
        <div className="hidden md:block border border-zinc-800/50 rounded-lg p-4 bg-zinc-900/20">
          <Canvas latestMessage={latestAssistantMessage} />
        </div>
      </main>
    </div>
  );
}
