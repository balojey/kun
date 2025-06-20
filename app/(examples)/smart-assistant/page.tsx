'use client';

import SmartConversationUI from './components/smart-conversation-ui';
import { useSmartAssistant } from './components/smart-assistant-provider';
import EmptyState from '../conversational-ai/components/empty-state';

export default function Page() {
  const { agents, error } = useSmartAssistant();

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="mb-4 text-2xl font-bold">Smart Assistant</h1>
        <p className="text-muted-foreground">Error loading agents: {error || 'Unknown error'}</p>
      </div>
    );
  }

  if (agents.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="container mx-auto p-6">
      <SmartConversationUI />
    </div>
  );
}