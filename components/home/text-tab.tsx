'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useRef, useEffect } from 'react';
import { Send, Mic, Volume2, MicOff, VolumeX, Bot, User, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createTranscription } from '@/app/actions/create-transcription';
import { useSpeech } from '@/hooks/use-speech';
import { STT_MODELS, TTS_MODELS } from '@/lib/schemas';
import { useConnections } from '@/hooks/use-connections';
import { useTokens } from '@/hooks/use-tokens';
import ReactMarkdown from 'react-markdown';

export function TextTab() {
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { speak } = useSpeech();
  const { connections, supabaseToken } = useConnections();
  
  const connectionIds = [
    ...connections.map(c => c.connection_id),
    ...(process.env.NEXT_PUBLIC_PICA_TAVILY_CONNECTION_ID ? [process.env.NEXT_PUBLIC_PICA_TAVILY_CONNECTION_ID] : [])
  ];

  const { messages, input, handleInputChange, handleSubmit, isLoading, append, stop, status } = useChat({
    api: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/chat`,
    body: { connectionIds },
    headers: {
      Authorization: `Bearer ${supabaseToken}`,
      'Content-Type': 'application/json',
    },
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
    maxSteps: 100,
  });

  const { hassufficientTokens } = useTokens();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startRecording = async () => {
    if (!hassufficientTokens(10)) {
      toast.error('Insufficient tokens for voice input');
      return;
    }

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
    
    if (!hassufficientTokens(5)) {
      toast.error('Insufficient tokens to process message');
      return;
    }
    
    handleSubmit(e);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Chat Interface */}
      <Card className="flex-1 border-0 shadow-lg min-h-0 flex flex-col">
        <CardHeader className="border-b border-border/50 flex-shrink-0 p-3 sm:p-6">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <span className="text-sm sm:text-base">AI Personal Assistant</span>
            </CardTitle>
            <div className="flex items-center gap-1 sm:gap-2">
              <Badge variant={isSpeechEnabled ? "default" : "secondary"} className="text-xs">
                {isSpeechEnabled ? "TTS On" : "TTS Off"}
              </Badge>
              <Badge variant={connections.length > 0 ? "default" : "secondary"} className="text-xs">
                {connections.length} Tools
              </Badge>
            </div>
          </div>
        </CardHeader>

        {/* Messages Area */}
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="flex-1 p-3 sm:p-6 overflow-y-auto">
            <div className="space-y-4 sm:space-y-6">
              {messages.length === 0 && (
                <div className="text-center py-8 sm:py-12">
                  <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 sm:mb-6">
                    <Bot className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Start a conversation</h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                    Type a message or use the microphone to get started
                  </p>
                  <div className="grid gap-1 sm:gap-2 max-w-md mx-auto text-xs sm:text-sm text-muted-foreground">
                    <p>• "Show me my unread emails"</p>
                    <p>• "What's on my calendar today?"</p>
                    <p>• "Create a new document"</p>
                  </div>
                </div>
              )}
              
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2 sm:gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-3 py-2 sm:px-6 sm:py-4 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground shadow-lg'
                        : 'bg-muted/50 text-foreground border border-border/50'
                    }`}
                  >
                    <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                      <ReactMarkdown>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                  
                  {message.role === 'user' && (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-2 sm:gap-4 justify-start items-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div className="bg-muted/50 rounded-2xl px-3 py-2 sm:px-6 sm:py-4 flex items-center border border-border/50">
                    <span className="text-xs sm:text-sm text-muted-foreground mr-2 sm:mr-3">Thinking</span>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-pulse" />
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-pulse delay-100" />
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-pulse delay-200" />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area - Fixed at bottom with proper mobile constraints */}
          <div className="border-t border-border/50 p-3 sm:p-6 bg-muted/20 flex-shrink-0">
            <form
              onSubmit={onSubmit}
              className="flex gap-2 sm:gap-3 items-end"
            >
              <div className="flex-1 min-w-0 space-y-2">
                <Input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Type your message or hold the mic button to speak..."
                  disabled={isLoading}
                  className="h-10 sm:h-12 text-sm sm:text-base border-0 bg-background shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20 w-full"
                />
              </div>
              
              <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                {/* Voice Input Button */}
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onMouseDown={startRecording}
                  onMouseUp={stopRecording}
                  onTouchStart={startRecording}
                  onTouchEnd={stopRecording}
                  disabled={isLoading}
                  className={`h-10 w-10 sm:h-12 sm:w-12 ${isRecording ? 'bg-red-500 text-white border-red-500' : ''}`}
                  aria-label={isRecording ? "Recording..." : "Hold to record"}
                >
                  {isRecording ? (
                    <MicOff className="h-3 w-3 sm:h-5 sm:w-5" />
                  ) : (
                    <Mic className="h-3 w-3 sm:h-5 sm:w-5" />
                  )}
                </Button>
                
                {/* TTS Toggle */}
                <Button
                  variant="outline"
                  size="icon"
                  type="button"
                  onClick={() => setIsSpeechEnabled(!isSpeechEnabled)}
                  className="h-10 w-10 sm:h-12 sm:w-12"
                  aria-label={isSpeechEnabled ? "Disable TTS" : "Enable TTS"}
                >
                  {isSpeechEnabled ? (
                    <Volume2 className="h-3 w-3 sm:h-5 sm:w-5 text-blue-500" />
                  ) : (
                    <VolumeX className="h-3 w-3 sm:h-5 sm:w-5" />
                  )}
                </Button>
                
                {/* Send Button */}
                <Button
                  type="submit"
                  disabled={!input.trim() || isLoading || !hassufficientTokens(10)}
                  size="icon"
                  className="h-10 w-10 sm:h-12 sm:w-12"
                  aria-label="Send message"
                >
                  <Send className="h-3 w-3 sm:h-5 sm:w-5" />
                </Button>
              </div>
            </form>
            
            <div className="flex items-center justify-between mt-2 sm:mt-3 text-xs text-muted-foreground">
              <span className="hidden sm:inline">Hold mic button to record • Click TTS to toggle voice responses</span>
              <span className="sm:hidden">Hold mic • Toggle TTS</span>
              <span>{input.length}/1000</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}