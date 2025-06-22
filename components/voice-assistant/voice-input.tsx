'use client';

import { useState } from 'react';
import { Mic, MicOff, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AssistantStep } from '@/types/assistantTypes';

interface VoiceInputProps {
  step: AssistantStep;
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onTextSubmit: (text: string) => void;
  disabled?: boolean;
}

export function VoiceInput({
  step,
  isRecording,
  onStartRecording,
  onStopRecording,
  onTextSubmit,
  disabled = false,
}: VoiceInputProps) {
  const [textInput, setTextInput] = useState('');

  const getStepDescription = () => {
    switch (step) {
      case 'idle':
        return 'Ready to listen';
      case 'recording':
        return 'Listening...';
      case 'transcribing':
        return 'Converting speech to text...';
      case 'processing':
        return 'Processing your command...';
      case 'speaking':
        return 'Generating response...';
      case 'complete':
        return 'Complete!';
      case 'error':
        return 'Error occurred';
      default:
        return '';
    }
  };

  const getStepColor = () => {
    switch (step) {
      case 'recording':
        return 'destructive';
      case 'transcribing':
      case 'processing':
      case 'speaking':
        return 'secondary';
      case 'complete':
        return 'default';
      case 'error':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const isProcessing = ['transcribing', 'processing', 'speaking'].includes(step);

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim() && !disabled && !isProcessing) {
      onTextSubmit(textInput.trim());
      setTextInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit(e as any);
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Badge */}
      <div className="flex justify-center">
        <Badge variant={getStepColor()} className="px-3 py-1">
          {getStepDescription()}
        </Badge>
      </div>

      {/* Voice Input - Primary */}
      <div className="flex flex-col items-center space-y-4">
        <Button
          size="lg"
          variant={isRecording ? "destructive" : "default"}
          className={cn(
            "h-20 w-20 rounded-full transition-all duration-200",
            isRecording && "animate-pulse scale-110",
            "shadow-lg hover:shadow-xl"
          )}
          onMouseDown={onStartRecording}
          onMouseUp={onStopRecording}
          onTouchStart={onStartRecording}
          onTouchEnd={onStopRecording}
          disabled={disabled || isProcessing}
        >
          {isProcessing ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : isRecording ? (
            <MicOff className="h-8 w-8" />
          ) : (
            <Mic className="h-8 w-8" />
          )}
        </Button>

        <p className="text-sm text-muted-foreground text-center max-w-xs">
          {isRecording 
            ? 'Release to stop recording' 
            : 'Hold to record your voice command'
          }
        </p>
      </div>

      {/* Text Input - Secondary */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground text-center">
          Or type your command:
        </p>
        <form onSubmit={handleTextSubmit} className="flex gap-2">
          <Input
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command..."
            disabled={disabled || isProcessing}
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!textInput.trim() || disabled || isProcessing}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}