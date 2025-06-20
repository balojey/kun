'use client';

import { formatDistanceToNow } from 'date-fns';
import { Mic, Type, User, Bot } from 'lucide-react';
import { VoiceLog } from '@/hooks/use-voice-assistant';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

interface ConversationHistoryProps {
  history: VoiceLog[];
  isLoading: boolean;
}

export function ConversationHistory({ history, isLoading }: ConversationHistoryProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <Card className="text-center py-8">
        <CardContent>
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Bot className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
          <p className="text-muted-foreground">
            Start by speaking or typing a command to your assistant
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-4">
        {history.map((log) => (
          <Card key={log.id} className="transition-colors hover:bg-accent/50">
            <CardContent className="pt-4">
              <div className="space-y-3">
                {/* User Input */}
                <div className="flex items-start gap-3">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <User className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    <Badge variant="outline" className="flex items-center gap-1">
                      {log.input_type === 'voice' ? (
                        <Mic className="h-3 w-3" />
                      ) : (
                        <Type className="h-3 w-3" />
                      )}
                      {log.input_type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <div className="ml-7">
                  <p className="text-sm">{log.input_text}</p>
                </div>

                {/* Assistant Response */}
                <div className="flex items-start gap-3">
                  <Bot className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-muted-foreground">{log.output_text}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}