'use client';

import { AppHeader } from '@/components/app-header';
import SmartConversationUI from './components/smart-conversation-ui';

export default function SmartAssistantPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto px-6 py-8">
        <SmartConversationUI />
      </main>
    </div>
  );
}