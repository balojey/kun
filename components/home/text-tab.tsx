'use client';

import { useChat } from 'ai/react';
import { useState, useRef, useEffect } from 'react';
import { Send, Mic, Volume2, MicOff, VolumeX, Bot, User } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { createTranscription } from '@/app/actions/create-transcription';
import { useSpeech } from '@/hooks/use-speech';
import { STT_MODELS, TTS_MODELS } from '@/lib/schemas';

export function TextTab() {
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { speak } = useSpeech();

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    onFinish: async (message) => {
      if (isSpeechEnabled && message.content) {
        try {
          await speak('21m00Tcm4TlvDq8ikWAM', {
            text: message.content,
            modelId: TTS_MODELS.FLASH,
            voiceSettings: {
              stability: 0.5,
              similarityBoost: 0.75,
              style: 0,
              speed: 1.0,
              useSpeakerBoost: false,
            },
          });
        } catch (error) {
          console.error('TTS error:', error);
        }
      }
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startRecording = async () => {
    try {
      setIsRecording(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processVoiceInput(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording. Please check microphone permissions.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      setIsRecording(false);
      mediaRecorderRef.current.stop();
    }
  };

  const processVoiceInput = async (audioBlob: Blob) => {
    try {
      const audioFile = new File([audioBlob], 'recording.wav', { type: 'audio/wav' });
      const transcriptionResult = await createTranscription({
        file: audioFile,
        modelId: STT_MODELS.SCRIBE_V1,
        timestampsGranularity: 'none',
        tagAudioEvents: false,
        diarize: false,
      });

      if (!transcriptionResult.ok) {
        throw new Error(transcriptionResult.error);
      }

      const transcript = transcriptionResult.value.text || '';
      if (!transcript.trim()) {
        throw new Error('No speech detected. Please try again.');
      }

      handleInputChange({ target: { value: transcript } } as any);
      toast.success('Speech transcribed successfully');
    } catch (error) {
      console.error('Error processing voice input:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process voice input');
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    handleSubmit(e);
  };

  return (
    <div className="space-y-6">
      {/* Chat Interface */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Chat Assistant</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Type or speak to interact with your AI assistant
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSpeechEnabled(!isSpeechEnabled)}
              className="flex items-center gap-2"
            >
              {isSpeechEnabled ? (
                <Volume2 className="h-4 w-4 text-blue-500" />
              ) : (
                <VolumeX className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-xs">
                {isSpeechEnabled ? 'TTS On' : 'TTS Off'}
              </span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Messages Area */}
          <ScrollArea className="h-[500px] p-6">
            <div className="space-y-6">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Bot className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
                  <p className="text-muted-foreground">
                    Type a message or use the microphone to get started
                  </p>
                </div>
              )}
              
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                  
                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-blue-500" />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-100" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-200" />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t border-border/50 p-4">
            <form onSubmit={onSubmit} className="flex gap-3">
              <div className="flex-1 relative">
                <Input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  className="pr-12 h-12 text-base border-0 bg-muted/50 focus-visible:ring-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                  onMouseDown={startRecording}
                  onMouseUp={stopRecording}
                  onTouchStart={startRecording}
                  onTouchEnd={stopRecording}
                  disabled={isLoading}
                >
                  {isRecording ? (
                    <MicOff className="h-4 w-4 text-red-500" />
                  ) : (
                    <Mic className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  )}
                </Button>
              </div>
              <Button 
                type="submit" 
                disabled={!input.trim() || isLoading}
                size="lg"
                className="h-12 px-6"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Hold the microphone button to record speech, or type your message
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="mx-auto w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Mic className="h-5 w-5 text-blue-500" />
              </div>
              <h3 className="font-medium">Speech Input</h3>
              <p className="text-xs text-muted-foreground">
                Hold microphone for voice-to-text
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="mx-auto w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <Volume2 className="h-5 w-5 text-green-500" />
              </div>
              <h3 className="font-medium">Voice Responses</h3>
              <p className="text-xs text-muted-foreground">
                Toggle to hear responses aloud
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="mx-auto w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Bot className="h-5 w-5 text-purple-500" />
              </div>
              <h3 className="font-medium">AI Powered</h3>
              <p className="text-xs text-muted-foreground">
                Smart email and tool management
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}