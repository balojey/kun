'use client';

import { User, Bot, Volume2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AudioPlayer } from './audio-player';
import { AssistantState } from '@/types/assistantTypes';

interface CurrentInteractionProps {
  state: AssistantState;
  onReset: () => void;
}

export function CurrentInteraction({ state, onReset }: CurrentInteractionProps) {
  const { currentInput, currentResponse, audioUrl, step } = state;

  if (!currentInput && !currentResponse) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Current Interaction</span>
          {(step === 'complete' || step === 'error') && (
            <Button variant="outline" size="sm" onClick={onReset}>
              New Command
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* User Input */}
        {currentInput && (
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-sm">You said:</p>
              <p className="text-sm text-muted-foreground mt-1">{currentInput}</p>
            </div>
          </div>
        )}

        {/* Assistant Response */}
        {currentResponse && (
          <div className="flex items-start gap-3">
            <Bot className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-sm">Assistant:</p>
                {audioUrl && (
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-3">{currentResponse}</p>
              
              {/* Audio Playback */}
              {audioUrl && (
                <div className="mt-3">
                  <AudioPlayer audioBase64={audioUrl} autoplay={true} />
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}