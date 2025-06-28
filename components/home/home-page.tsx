'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VoiceTab } from '@/components/home/voice-tab';
import { TextTab } from '@/components/home/text-tab';
import { Button } from '@/components/ui/button';
import { Mic, MessageSquare, Lightbulb, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function HomePage() {
  const [activeTab, setActiveTab] = useState('voice');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto relative">
      {/* Main Content Area */}
      <div className={cn(
        "flex-1 min-w-0 flex flex-col min-h-0 transition-all duration-300",
        sidebarOpen ? "lg:mr-80" : ""
      )}>
        {/* Main Interface Card */}
        <Card className="flex-1 border-0 shadow-2xl bg-card/50 backdrop-blur-sm min-h-0">
          <CardContent className="p-0 h-full flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              {/* Tab Navigation */}
              <div className="flex-shrink-0 bg-card/80 backdrop-blur-sm border-b border-border/50">
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
              <div className="flex-1 p-6 pt-2 min-h-0">
                <TabsContent value="voice" className="mt-0 h-full">
                  <div className={`h-full ${activeTab === 'voice' ? 'block' : 'hidden'}`}>
                    <VoiceTab />
                  </div>
                </TabsContent>

                <TabsContent value="text" className="mt-0 h-full">
                  <div className={`h-full ${activeTab === 'text' ? 'block' : 'hidden'}`}>
                    <TextTab />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar Toggle Button - Always Visible */}
      <Button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        variant="outline"
        size="icon"
        className={cn(
          "fixed top-1/2 -translate-y-1/2 z-50 h-12 w-8 rounded-l-lg rounded-r-none shadow-lg bg-background/95 backdrop-blur-sm border-r-0 transition-all duration-300",
          sidebarOpen 
            ? "right-80 lg:right-80" 
            : "right-0"
        )}
        aria-label={sidebarOpen ? "Close sidebar" : "Open voice commands guide"}
      >
        {sidebarOpen ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>

      {/* Right Sidebar - Voice Commands Tutorial */}
      <div className={cn(
        "fixed right-0 top-0 h-full w-80 bg-background/95 backdrop-blur-sm border-l border-border/50 shadow-2xl transition-transform duration-300 z-40",
        sidebarOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <Card className="h-full border-0 shadow-none bg-gradient-to-br from-primary/5 to-primary/10 flex flex-col rounded-none">
          <CardHeader className="pb-4 flex-shrink-0 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Voice Commands Guide</CardTitle>
              </div>
              <Button
                onClick={() => setSidebarOpen(false)}
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label="Close sidebar"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription>
              Natural language examples to get you started
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-4 p-6">
            {/* Email Management */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-primary">📧 Email Management</h4>
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                  <p className="text-sm font-medium mb-1">"Show me my unread emails"</p>
                  <p className="text-xs text-muted-foreground">View and manage your inbox</p>
                </div>
                <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                  <p className="text-sm font-medium mb-1">"Archive all newsletters"</p>
                  <p className="text-xs text-muted-foreground">Organize emails automatically</p>
                </div>
                <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                  <p className="text-sm font-medium mb-1">"Delete emails from last week"</p>
                  <p className="text-xs text-muted-foreground">Bulk email management</p>
                </div>
              </div>
            </div>

            {/* Email Composition */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-primary">✍️ Email Composition</h4>
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                  <p className="text-sm font-medium mb-1">"Reply to Sarah about the meeting"</p>
                  <p className="text-xs text-muted-foreground">Compose and send responses</p>
                </div>
                <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                  <p className="text-sm font-medium mb-1">"Draft an email to the team"</p>
                  <p className="text-xs text-muted-foreground">Create new messages</p>
                </div>
              </div>
            </div>

            {/* Calendar & Scheduling */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-primary">📅 Calendar & Scheduling</h4>
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                  <p className="text-sm font-medium mb-1">"Schedule a call with the team"</p>
                  <p className="text-xs text-muted-foreground">Calendar management</p>
                </div>
                <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                  <p className="text-sm font-medium mb-1">"What's on my calendar today?"</p>
                  <p className="text-xs text-muted-foreground">Check your schedule</p>
                </div>
              </div>
            </div>

            {/* Pro Tips */}
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-200 text-sm">
                    Pro Tip
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Speak naturally! Aven understands context and can handle complex requests like "Find emails about the project from last month and summarize them."
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}
    </div>
  );
}