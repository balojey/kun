'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VoiceTab } from '@/components/home/voice-tab';
import { TextTab } from '@/components/home/text-tab';
import { Mic, MessageSquare } from 'lucide-react';

export function HomePage() {
  const [activeTab, setActiveTab] = useState('voice');

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-8">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gradient">
          Aven Assistant
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Manage your emails and connected tools through natural voice and text conversations
        </p>
      </div>

      {/* Tab Interface */}
      <div className="w-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-2 h-12">
              <TabsTrigger value="voice" className="flex items-center gap-2 text-sm font-medium">
                <Mic className="h-4 w-4" />
                Voice
              </TabsTrigger>
              <TabsTrigger value="text" className="flex items-center gap-2 text-sm font-medium">
                <MessageSquare className="h-4 w-4" />
                Text
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="voice" className="mt-0">
            <VoiceTab />
          </TabsContent>

          <TabsContent value="text" className="mt-0">
            <TextTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}