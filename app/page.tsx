'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VoiceTab } from '@/components/home/voice-tab';
import { TextTab } from '@/components/home/text-tab';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('voice');

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">AI Assistant</h1>
          <p className="text-muted-foreground">
            Manage your emails and connected tools with voice or text
          </p>
        </div>

        {/* Tab Switcher */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="voice" className="flex items-center gap-2">
              <span className="text-lg">🎤</span>
              Voice
            </TabsTrigger>
            <TabsTrigger value="text" className="flex items-center gap-2">
              <span className="text-lg">💬</span>
              Text
            </TabsTrigger>
          </TabsList>

          {/* Voice Tab Content */}
          <TabsContent value="voice" className="mt-8">
            <VoiceTab />
          </TabsContent>

          {/* Text Tab Content */}
          <TabsContent value="text" className="mt-8">
            <TextTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}