'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VoiceTab } from '@/components/home/voice-tab';
import { TextTab } from '@/components/home/text-tab';
import { Mic, MessageSquare, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function HomePage() {
  const [activeTab, setActiveTab] = useState('voice');

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Main Interface Card */}
      <Card className="border-0 shadow-2xl bg-card/50 backdrop-blur-sm">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Tab Navigation */}
            <div className="sticky top-0 z-30 bg-card/80 backdrop-blur-sm border-b border-border/50">
              <div className="flex justify-center p-6 pb-4">
                <TabsList className="grid w-full max-w-md grid-cols-2 h-14 bg-muted/60 rounded-2xl shadow-lg border border-border/40 p-1">
                  <TabsTrigger
                    value="voice"
                    className="flex items-center justify-center gap-3 text-base font-medium h-full rounded-xl transition-all duration-300 ease-in-out data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xl data-[state=active]:ring-4 data-[state=active]:ring-primary/20 data-[state=active]:scale-105 data-[state=inactive]:opacity-80"
                  >
                    <Mic className="h-5 w-5" />
                    Voice
                  </TabsTrigger>
                  <TabsTrigger
                    value="text"
                    className="flex items-center justify-center gap-3 text-base font-medium h-full rounded-xl transition-all duration-300 ease-in-out data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xl data-[state=active]:ring-4 data-[state=active]:ring-primary/20 data-[state=active]:scale-105 data-[state=inactive]:opacity-80"
                  >
                    <MessageSquare className="h-5 w-5" />
                    Text
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6 pt-2">
              <TabsContent value="voice" className="mt-0">
                <div className={activeTab === 'voice' ? 'block' : 'hidden'}>
                  <VoiceTab />
                </div>
              </TabsContent>

              <TabsContent value="text" className="mt-0">
                <div className={activeTab === 'text' ? 'block' : 'hidden'}>
                  <TextTab />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}