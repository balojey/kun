'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useVoiceAssistant } from '@/hooks/use-voice-assistant';
import { VoiceInput } from '@/components/voice-assistant/voice-input';
import { CurrentInteraction } from '@/components/voice-assistant/current-interaction';
import { ConversationHistory } from '@/components/voice-assistant/conversation-history';

export default function VoiceActionPage() {
  const {
    state,
    conversationHistory,
    isLoadingHistory,
    startRecording,
    stopRecording,
    handleTextInput,
    reset,
  } = useVoiceAssistant();

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Voice Assistant</h1>
          <p className="text-muted-foreground">
            Speak or type commands to control your connected tools
          </p>
        </div>

        {/* Main Voice Interface */}
        <Card className="mx-auto max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle>Voice Command Interface</CardTitle>
            <CardDescription>
              Use voice or text to interact with your assistant
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Voice/Text Input */}
            <VoiceInput
              step={state.step}
              isRecording={state.isRecording}
              onStartRecording={startRecording}
              onStopRecording={stopRecording}
              onTextSubmit={handleTextInput}
            />

            {/* Error Display */}
            {state.error && (
              <Alert variant="destructive">
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}

            {/* Current Interaction */}
            <CurrentInteraction state={state} onReset={reset} />
          </CardContent>
        </Card>

        <Separator />

        {/* Conversation History */}
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold">Conversation History</h2>
            <p className="text-muted-foreground text-sm">
              Your recent interactions with the assistant
            </p>
          </div>

          <ConversationHistory 
            history={conversationHistory} 
            isLoading={isLoadingHistory} 
          />
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">How to Use</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-2">Voice Commands:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Hold the microphone button and speak</li>
                  <li>• Release when finished speaking</li>
                  <li>• Wait for the assistant's response</li>
                  <li>• Audio response will play automatically</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Text Commands:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Type in the text input field</li>
                  <li>• Press Enter or click Send</li>
                  <li>• Response will be spoken and displayed</li>
                  <li>• All interactions are saved to history</li>
                </ul>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-medium mb-2">Example Commands:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• "Send email to john@example.com subject Meeting body Let's meet tomorrow"</li>
                <li>• "Create event Team Standup"</li>
                <li>• "Add to Notion: Project ideas"</li>
                <li>• "Schedule meeting with the team"</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}