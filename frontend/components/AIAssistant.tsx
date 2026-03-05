// components/AIAssistant.tsx
// Orchestrates AIWelcomeModal + AIChatBox with a single shared hook state
'use client';

import AIChatBox from './AIChatBox';
import AIWelcomeModal from './AIWelcomeModal';
import { useAIChat } from '@/lib/useAIChat';

export default function AIAssistant() {
  const { state, toggleChat, sendMessage, resetChat, openChat } = useAIChat();

  return (
    <>
      <AIWelcomeModal onStartChat={openChat} />
      <AIChatBox
        externalState={state}
        onToggle={toggleChat}
        onSend={sendMessage}
        onReset={resetChat}
      />
    </>
  );
}
