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
    <div className="h-full flex flex-col space-y-6">
      {/* Chat Interface */}
      <Card className="flex-1 border-0 shadow-lg min-h-0">
        <CardHeader className="border-b border-border/50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              AI Assistant
            </CardTitle>
            <div className="flex items-center gap-2">
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
        <CardContent className="p-0 flex-1 min-h-0">
          <div className="h-full p-6 overflow-y-auto">
            <div className="space-y-6">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <Bot className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Start a conversation</h3>
                  <p className="text-muted-foreground mb-6">
                    Type a message or use the microphone to get started
                  </p>
                  <div className="grid gap-2 max-w-md mx-auto text-sm text-muted-foreground">
                    <p>• "Show me my unread emails"</p>
                    <p>• "Reply to the latest message from John"</p>
                    <p>• "Archive all promotional emails"</p>
                  </div>
                </div>
              )}
              
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[80%] rounded-2xl px-6 py-4 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground shadow-lg'
                        : 'bg-muted/50 text-foreground border border-border/50'
                    }`}
                  >
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                      <ReactMarkdown>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                  
                  {message.role === 'user' && (
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-blue-500" />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-4 justify-start items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                  <div className="bg-muted/50 rounded-2xl px-6 py-4 flex items-center border border-border/50">
                    <span className="text-sm text-muted-foreground mr-3">Thinking</span>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-100" />
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-200" />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-border/50 p-6 bg-muted/20 flex-shrink-0">
            <form
              onSubmit={onSubmit}
              className="flex gap-3 items-end"
            >
              <div className="flex-1 space-y-2">
                <Input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Type your message or hold the mic button to speak..."
                  disabled={isLoading}
                  className="h-12 text-base border-0 bg-background shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20"
                />
              </div>
              
              <div className="flex gap-2">
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
                  className={`h-12 w-12 ${isRecording ? 'bg-red-500 text-white border-red-500' : ''}`}
                  aria-label={isRecording ? "Recording..." : "Hold to record"}
                >
                  {isRecording ? (
                    <MicOff className="h-5 w-5" />
                  ) : (
                    <Mic className="h-5 w-5" />
                  )}
                </Button>
                
                {/* TTS Toggle */}
                <Button
                  variant="outline"
                  size="icon"
                  type="button"
                  onClick={() => setIsSpeechEnabled(!isSpeechEnabled)}
                  className="h-12 w-12"
                  aria-label={isSpeechEnabled ? "Disable TTS" : "Enable TTS"}
                >
                  {isSpeechEnabled ? (
                    <Volume2 className="h-5 w-5 text-blue-500" />
                  ) : (
                    <VolumeX className="h-5 w-5" />
                  )}
                </Button>
                
                {/* Send Button */}
                <Button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="h-12 w-12"
                  aria-label="Send message"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </form>
            
            <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
              <span>Hold mic button to record • Click TTS to toggle voice responses</span>
              <span>{input.length}/1000</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}