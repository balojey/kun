'use client';

import { useState } from 'react';
import { Mic, MicOff, RotateCcw, Volume2, Loader2 } from 'lucide-react';
import { useVoiceFlow } from '@/hooks/use-voice-flow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AudioPlayer } from '@/app/(examples)/text-to-speech/components/audio-player';

export default function VoiceActionPage() {
  const { state, startRecording, stopRecording, reset, isRecording, isProcessing } = useVoiceFlow();

  const getStepDescription = () => {
    switch (state.step) {
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
    switch (state.step) {
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

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Voice Actions</h1>
          <p className="text-muted-foreground">
            Speak commands to control your connected tools
          </p>
        </div>

        {/* Main Voice Interface */}
        <Card className="mx-auto max-w-2xl">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Badge variant={getStepColor()}>{getStepDescription()}</Badge>
            </div>
            <CardTitle className="flex items-center justify-center gap-2">
              <Volume2 className="h-5 w-5" />
              Voice Command Interface
            </CardTitle>
            <CardDescription>
              Press and hold the microphone to record your command
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Voice Control Button */}
            <div className="flex justify-center">
              <Button
                size="lg"
                variant={isRecording ? "destructive" : "default"}
                className={`h-20 w-20 rounded-full transition-all duration-200 ${
                  isRecording ? 'animate-pulse scale-110' : ''
                }`}
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onTouchStart={startRecording}
                onTouchEnd={stopRecording}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : isRecording ? (
                  <MicOff className="h-8 w-8" />
                ) : (
                  <Mic className="h-8 w-8" />
                )}
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              {isRecording ? 'Release to stop recording' : 'Hold to record'}
            </div>

            {/* Error Display */}
            {state.error && (
              <Alert variant="destructive">
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}

            {/* Transcript Display */}
            {state.transcript && (
              <div className="space-y-2">
                <h3 className="font-medium">What you said:</h3>
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm">{state.transcript}</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Response Display */}
            {state.response && (
              <div className="space-y-2">
                <h3 className="font-medium">Response:</h3>
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm">{state.response}</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Audio Playback */}
            {state.audioUrl && (
              <div className="space-y-2">
                <h3 className="font-medium">Audio Response:</h3>
                <AudioPlayer audioBase64={state.audioUrl} autoplay={true} />
              </div>
            )}

            {/* Reset Button */}
            {(state.step === 'complete' || state.step === 'error') && (
              <>
                <Separator />
                <div className="flex justify-center">
                  <Button variant="outline" onClick={reset}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Start Over
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">How to Use</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-2">Supported Commands:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• "Send email to john@example.com subject Meeting body Let's meet tomorrow"</li>
                  <li>• "Create event Team Standup"</li>
                  <li>• "Add to Notion: Project ideas"</li>
                  <li>• "Schedule meeting with the team"</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Requirements:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Connect your tools in the Connections page</li>
                  <li>• Allow microphone access</li>
                  <li>• Speak clearly and wait for processing</li>
                  <li>• Commands are processed in real-time</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}