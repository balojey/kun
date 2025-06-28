'use client';

import { useState } from 'react';
import { VoiceTab } from '@/components/home/voice-tab';
import { TextTab, useSuggestionContext } from '@/components/home/text-tab';
import { useInterfaceMode } from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Lightbulb, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Suggestion Item Component
function SuggestionItem({ 
  title, 
  description, 
  onClick 
}: { 
  title: string; 
  description: string; 
  onClick: () => void; 
}) {
  return (
    <button
      onClick={onClick}
      className="w-full p-2 sm:p-3 rounded-lg bg-background/50 border border-border/50 hover:border-primary/50 hover:bg-accent/50 transition-all duration-200 text-left group"
    >
      <p className="text-xs sm:text-sm font-medium mb-1 group-hover:text-primary transition-colors">
        {title}
      </p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </button>
  );
}

// Sidebar Content Component
function SidebarContent({ onSuggestionClick }: { onSuggestionClick: (suggestion: string) => void }) {
  const { isTextMode, setIsTextMode } = useInterfaceMode();

  const handleSuggestionClick = (suggestion: string) => {
    // Switch to text mode if not already
    if (!isTextMode) {
      setIsTextMode(true);
    }
    // Call the suggestion click handler
    onSuggestionClick(suggestion);
  };

  return (
    <CardContent className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 p-4 sm:p-6">
      {/* Email Management */}
      <div className="space-y-2 sm:space-y-3">
        <h4 className="font-medium text-xs sm:text-sm text-primary">📧 Email Management</h4>
        <div className="space-y-2">
          <SuggestionItem
            title="Show me my unread emails"
            description="View and manage your inbox"
            onClick={() => handleSuggestionClick("Show me my unread emails")}
          />
          <SuggestionItem
            title="Archive all newsletters"
            description="Organize emails automatically"
            onClick={() => handleSuggestionClick("Archive all newsletters")}
          />
          <SuggestionItem
            title="Delete emails from last week"
            description="Bulk email management"
            onClick={() => handleSuggestionClick("Delete emails from last week")}
          />
        </div>
      </div>

      {/* Email Composition */}
      <div className="space-y-2 sm:space-y-3">
        <h4 className="font-medium text-xs sm:text-sm text-primary">✍️ Email Composition</h4>
        <div className="space-y-2">
          <SuggestionItem
            title="Reply to Sarah about the meeting"
            description="Compose and send responses"
            onClick={() => handleSuggestionClick("Reply to Sarah about the meeting")}
          />
          <SuggestionItem
            title="Draft an email to the team"
            description="Create new messages"
            onClick={() => handleSuggestionClick("Draft an email to the team")}
          />
        </div>
      </div>

      {/* Calendar & Scheduling */}
      <div className="space-y-2 sm:space-y-3">
        <h4 className="font-medium text-xs sm:text-sm text-primary">📅 Calendar & Scheduling</h4>
        <div className="space-y-2">
          <SuggestionItem
            title="Schedule a call with the team"
            description="Calendar management"
            onClick={() => handleSuggestionClick("Schedule a call with the team")}
          />
          <SuggestionItem
            title="What's on my calendar today?"
            description="Check your schedule"
            onClick={() => handleSuggestionClick("What's on my calendar today?")}
          />
        </div>
      </div>

      {/* Document Management */}
      <div className="space-y-2 sm:space-y-3">
        <h4 className="font-medium text-xs sm:text-sm text-primary">📄 Document Management</h4>
        <div className="space-y-2">
          <SuggestionItem
            title="Create a new document"
            description="Generate documents and notes"
            onClick={() => handleSuggestionClick("Create a new document")}
          />
          <SuggestionItem
            title="Find my project files"
            description="Search and organize files"
            onClick={() => handleSuggestionClick("Find my project files")}
          />
        </div>
      </div>

      {/* Pro Tips */}
      <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-2 sm:gap-3">
          <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 sm:mt-2 flex-shrink-0" />
          <div>
            <p className="font-medium text-blue-800 dark:text-blue-200 text-xs sm:text-sm">
              Pro Tip
            </p>
            <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 mt-1">
              Speak naturally! Aven understands context and can handle complex requests like "Find emails about the project from last month and summarize them."
            </p>
          </div>
        </div>
      </div>
    </CardContent>
  );
}

export function HomePage() {
  const { isTextMode } = useInterfaceMode();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-full w-full flex flex-col relative">
      {/* Main Content Area */}
      <div className="flex-1 min-h-0 w-full">
        {/* Main Interface Card */}
        <Card className="h-full border-0 shadow-2xl bg-card/50 backdrop-blur-sm">
          <CardContent className="p-0 h-full flex flex-col">
            {/* Interface Content */}
            <div className="flex-1 p-3 sm:p-4 md:p-6 min-h-0">
              {isTextMode ? (
                <div className="h-full">
                  <TextTab />
                </div>
              ) : (
                <div className="h-full">
                  <VoiceTab />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar Toggle Button - Responsive positioning */}
      <Button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        variant="outline"
        size="icon"
        className={cn(
          "fixed z-50 h-10 w-8 rounded-l-lg rounded-r-none shadow-lg bg-background/95 backdrop-blur-sm border-r-0 transition-all duration-300",
          "top-1/2 -translate-y-1/2",
          // Mobile positioning
          "sm:h-12",
          sidebarOpen 
            ? "right-80 sm:right-80 md:right-80 lg:right-80" 
            : "right-0"
        )}
        aria-label={sidebarOpen ? "Close sidebar" : "Open voice commands guide"}
      >
        {sidebarOpen ? (
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
        ) : (
          <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
        )}
      </Button>

      {/* Right Sidebar - Voice Commands Tutorial */}
      <div className={cn(
        "fixed right-0 top-0 h-full w-80 max-w-[90vw] bg-background/95 backdrop-blur-sm border-l border-border/50 shadow-2xl transition-transform duration-300 z-40",
        sidebarOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <Card className="h-full border-0 shadow-none bg-gradient-to-br from-primary/5 to-primary/10 flex flex-col rounded-none">
          <CardHeader className="pb-3 sm:pb-4 flex-shrink-0 border-b border-border/50 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                <CardTitle className="text-base sm:text-lg truncate">Voice Commands</CardTitle>
              </div>
              <Button
                onClick={() => setSidebarOpen(false)}
                variant="ghost"
                size="icon"
                className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0"
                aria-label="Close sidebar"
              >
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
            <CardDescription className="text-xs sm:text-sm">
              Click any command to try it instantly
            </CardDescription>
          </CardHeader>
          
          {/* Render sidebar content with suggestion context */}
          {isTextMode ? (
            // When in text mode, use the context from TextTab
            <TextTabSidebarContent />
          ) : (
            // When in voice mode, provide a fallback handler
            <SidebarContent onSuggestionClick={(suggestion) => {
              // This will be handled by switching to text mode in SidebarContent
            }} />
          )}
        </Card>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}
    </div>
  );
}

// Component to use suggestion context when in text mode
function TextTabSidebarContent() {
  try {
    const { handleSuggestionClick } = useSuggestionContext();
    return <SidebarContent onSuggestionClick={handleSuggestionClick} />;
  } catch {
    // Fallback if context is not available
    return <SidebarContent onSuggestionClick={() => {}} />;
  }
}