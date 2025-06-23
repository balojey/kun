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

      {/* Tab Interface */}
      <div className="w-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="w-full sticky top-17 z-30">
            <div className="flex justify-center mb-8">
              <TabsList
                className="
                  grid w-full max-w-md grid-cols-2 h-12
                  bg-muted/60 rounded-xl shadow-md
                  border border-border/40
                  p-1 rounded-3xl
                "
              >
                <TabsTrigger
                  value="voice"
                  className={`
                    flex items-center justify-center gap-2 text-sm font-medium
                    w-full h-full
                    rounded-3xl transition-all duration-300 ease-in-out
                    data-[state=active]:bg-primary data-[state=active]:text-primary-foreground
                    data-[state=active]:shadow-xl
                    data-[state=active]:ring-4 data-[state=active]:ring-primary/40
                    data-[state=active]:scale-110
                    data-[state=inactive]:opacity-80
                  `}
                >
                  <Mic className="h-4 w-4" />
                  Voice
                </TabsTrigger>
                <TabsTrigger
                  value="text"
                  className={`
                    flex items-center justify-center gap-2 text-sm font-medium
                    w-full h-full
                    rounded-3xl transition-all duration-300 ease-in-out
                    data-[state=active]:bg-primary data-[state=active]:text-primary-foreground
                    data-[state=active]:shadow-xl
                    data-[state=active]:ring-4 data-[state=active]:ring-primary/40
                    data-[state=active]:scale-110
                    data-[state=inactive]:opacity-80
                  `}
                >
                  <MessageSquare className="h-4 w-4" />
                  Text
                </TabsTrigger>
              </TabsList>
            </div>
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