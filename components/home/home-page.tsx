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
      {/* Welcome Header */}
      <div className="text-center space-y-4 py-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 mb-4">
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-medium">AI-Powered Email Assistant</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gradient">
          Welcome to Aven
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Transform your email workflow with natural conversation. 
          Speak or type your commands and watch Aven handle the rest.
        </p>
      </div>

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

      {/* Quick Tips */}
      <div className="grid gap-4 md:grid-cols-3 mt-12">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
              <Mic className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="font-semibold mb-2">Voice Commands</h3>
            <p className="text-sm text-muted-foreground">
              "Show me unread emails" or "Reply to John about the meeting"
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-6 w-6 text-green-500" />
            </div>
            <h3 className="font-semibold mb-2">Text Interface</h3>
            <p className="text-sm text-muted-foreground">
              Type commands for precise control and complex requests
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-6 w-6 text-purple-500" />
            </div>
            <h3 className="font-semibold mb-2">Smart Actions</h3>
            <p className="text-sm text-muted-foreground">
              AI understands context and automates complex workflows
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}