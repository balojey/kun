'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useRef, useEffect } from 'react';
import { Send, Mic, Volume2, MicOff, VolumeX, Bot, User } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createTranscription } from '@/app/actions/create-transcription';
import { useSpeech } from '@/hooks/use-speech';
import { STT_MODELS, TTS_MODELS } from '@/lib/schemas';
import { useConnections } from '@/hooks/use-connections';
import { useTokens } from '@/hooks/use-tokens';
import { TokenUsageTracker } from '@/components/tokens/token-usage-tracker';
import ReactMarkdown from 'react-markdown';

export function TextTab() {
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { speak } = useSpeech();
  const { connections } = useConnections();
  const { hassufficientTokens } = useTokens();
  
  const connectionIds = [
    ...connections.map(c => c.connection_id),
    ...(process.env.NEXT_PUBLIC_PICA_TAVILY_CONNECTION_ID ? [process.env.NEXT_PUBLIC_PICA_TAVILY_CONNECTION_ID] : [])
  ];

  const { messages, input, handleInputChange, handleSubmit, isLoading, append, stop, status } = useChat({
    api: '/api/chat',
    body: { connectionIds },
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startRecording = async () => {
    // Check if user has sufficient tokens for at least 10 seconds of conversation
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
    
    // Check if user has sufficient tokens for processing
    if (!hassufficientTokens(5)) {
      toast.error('Insufficient tokens to process message');
      return;
    }
    
    handleSubmit(e);
  };

  const handleSessionStart = (newSessionId: string) => {
    setSessionId(newSessionId);
  };

  const handleSessionEnd = () => {
    setSessionId(null);
  };

  const handleInsufficientTokens = () => {
    toast.error('Insufficient tokens for Pica automation');
  };

  return (
    <div className="space-y-6">
      {/* Token Usage Tracker */}
      <TokenUsageTracker
        serviceType="pica_endpoint"
        isActive={isLoading}
        onSessionStart={handleSessionStart}
        onSessionEnd={handleSessionEnd}
        onInsufficientTokens={handleInsufficientTokens}
      />

      {/* Chat Interface */}
      <div className="">
        {/* Messages Area */}
        <div className="h-[500px] p-6 overflow-y-auto">
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
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    <ReactMarkdown>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                </div>
                
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-blue-500" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start items-center">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted rounded-2xl px-4 py-3 flex items-center">
                  <span className="text-sm text-muted-foreground mr-2">Working</span>
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
        </div>

        {/* Input Area - now sticky at the bottom */}
        <div className="border-t border-border/50 p-4 bg-background sticky bottom-0 left-0 w-full z-20">
          <form
            onSubmit={onSubmit}
            className="flex flex-col sm:flex-row gap-3 items-stretch"
          >
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message..."
              disabled={isLoading}
              className="h-12 text-base border-0 bg-muted/50 focus-visible:ring-1 flex-1"
            />
            <div className="flex gap-2 justify-end">
              {/* Mic button */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onTouchStart={startRecording}
                onTouchEnd={stopRecording}
                disabled={isLoading}
                aria-label={isRecording ? "Stop recording" : "Start recording"}
              >
                {isRecording ? (
                  <MicOff className="h-5 w-5 text-red-500" />
                ) : (
                  <Mic className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                )}
              </Button>
              {/* TTS toggle */}
              <Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={() => setIsSpeechEnabled(!isSpeechEnabled)}
                aria-label={isSpeechEnabled ? "Disable TTS" : "Enable TTS"}
              >
                {isSpeechEnabled ? (
                  <Volume2 className="h-5 w-5 text-blue-500" />
                ) : (
                  <VolumeX className="h-5 w-5 text-muted-foreground" />
                )}
              </Button>
            </div>
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              size="lg"
              className="h-12 px-6"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Hold the microphone button to record speech, or type your message
          </p>
        </div>
      </div>
    </div>
  );
}