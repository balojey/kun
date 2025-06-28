'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useRef, useEffect } from 'react';
import { Send, Mic, Volume2, MicOff, VolumeX, Bot, User, Sparkles, ArrowUp } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { createTranscription } from '@/app/actions/create-transcription';
import { useSpeech } from '@/hooks/use-speech';
import { STT_MODELS, TTS_MODELS } from '@/lib/schemas';
import { useConnections } from '@/hooks/use-connections';
import { useTokens } from '@/hooks/use-tokens';
import ReactMarkdown from 'react-markdown';
import { createContext, useContext } from 'react';

// Create context for suggestion clicks
interface SuggestionContextType {
  handleSuggestionClick: (suggestion: string) => void;
}

const SuggestionContext = createContext<SuggestionContextType | undefined>(undefined);

export function useSuggestionContext() {
  const context = useContext(SuggestionContext);
  if (context === undefined) {
    throw new Error('useSuggestionContext must be used within a SuggestionProvider');
  }
  return context;
}

export function TextTab() {
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { speak } = useSpeech();
  const { connections, supabaseToken } = useConnections();
  
  const connectionIds = [
    ...connections.map(c => c.connection_id),
    ...(process.env.NEXT_PUBLIC_PICA_TAVILY_CONNECTION_ID ? [process.env.NEXT_PUBLIC_PICA_TAVILY_CONNECTION_ID] : [])
  ];

  const { messages, input, handleInputChange, handleSubmit, isLoading, append, stop, status, setInput } = useChat({
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

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSuggestionClick = (suggestion: string) => {
    // Extract just the command text from the suggestion
    const commandText = suggestion.replace(/^"(.*)"$/, '$1');
    setInput(commandText);
    
    // Focus the textarea
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

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

      setInput(transcript);
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e as any);
    }
  };

  return (
    <SuggestionContext.Provider value={{ handleSuggestionClick }}>
      <div className="h-full flex flex-col bg-background">
        {/* Header */}
        <div className="flex-shrink-0 border-b border-border/50 p-3 sm:p-4 bg-background/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <span className="text-sm sm:text-base font-medium">AI Personal Assistant</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <Badge variant={isSpeechEnabled ? "default" : "secondary"} className="text-xs">
                {isSpeechEnabled ? "TTS On" : "TTS Off"}
              </Badge>
              <Badge variant={connections.length > 0 ? "default" : "secondary"} className="text-xs">
                {connections.length} Tools
              </Badge>
            </div>
          </div>
        </div>

        {/* Messages Area - ChatGPT Style */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
            {messages.length === 0 && (
              <div className="text-center py-8 sm:py-12">
                <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 sm:mb-6">
                  <Bot className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-3">How can I help you today?</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 max-w-md mx-auto">
                  I can help you manage emails, schedule meetings, organize documents, and much more.
                </p>
                
                {/* Quick Start Examples */}
                <div className="grid gap-2 sm:gap-3 max-w-2xl mx-auto">
                  {[
                    "Show me my unread emails",
                    "What's on my calendar today?",
                    "Create a new document",
                    "Schedule a meeting with the team"
                  ].map((example, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(example)}
                      className="p-2 sm:p-3 text-left border border-border/50 rounded-xl hover:border-primary/50 hover:bg-accent/50 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors flex-shrink-0">
                          <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                        </div>
                        <span className="text-xs sm:text-sm font-medium">{example}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Messages */}
            <div className="space-y-4 sm:space-y-6">
              {messages.map((message) => (
                <div key={message.id} className="group">
                  <div className={`flex gap-3 sm:gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {message.role === 'assistant' && (
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                      </div>
                    )}
                    
                    <div className={`max-w-[80%] ${message.role === 'user' ? 'order-1' : ''}`}>
                      <div
                        className={`rounded-2xl px-3 sm:px-4 py-2 sm:py-3 ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground ml-auto'
                            : 'bg-muted/50 border border-border/50'
                        }`}
                      >
                        <div className="text-xs sm:text-sm leading-relaxed">
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                              ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                              li: ({ children }) => <li className="text-xs sm:text-sm">{children}</li>,
                              code: ({ children }) => <code className="bg-black/10 px-1 py-0.5 rounded text-xs">{children}</code>,
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                    
                    {message.role === 'user' && (
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-1 order-2">
                        <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3 sm:gap-4 justify-start">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                  </div>
                  <div className="bg-muted/50 border border-border/50 rounded-2xl px-3 sm:px-4 py-2 sm:py-3 flex items-center">
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-pulse" />
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-pulse delay-100" />
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-pulse delay-200" />
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area - ChatGPT Style - Fixed at bottom */}
        <div className="flex-shrink-0 border-t border-border/50 bg-background">
          <div className="max-w-3xl mx-auto p-3 sm:p-4">
            <form onSubmit={onSubmit} className="relative">
              <div className="relative flex items-end gap-2 p-2 sm:p-3 border border-border/50 rounded-xl bg-background shadow-sm focus-within:border-primary/50 focus-within:shadow-md transition-all duration-200">
                {/* Voice Input Button */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onMouseDown={startRecording}
                  onMouseUp={stopRecording}
                  onTouchStart={startRecording}
                  onTouchEnd={stopRecording}
                  disabled={isLoading}
                  className={`h-8 w-8 flex-shrink-0 ${isRecording ? 'bg-red-500/10 text-red-500' : 'hover:bg-accent'}`}
                  aria-label={isRecording ? "Recording..." : "Hold to record"}
                >
                  {isRecording ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>

                {/* Textarea */}
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Message Aven..."
                  disabled={isLoading}
                  className="flex-1 min-h-[20px] max-h-[200px] resize-none border-0 bg-transparent p-0 text-xs sm:text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground"
                  rows={1}
                />

                {/* TTS Toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={() => setIsSpeechEnabled(!isSpeechEnabled)}
                  className="h-8 w-8 flex-shrink-0 hover:bg-accent"
                  aria-label={isSpeechEnabled ? "Disable TTS" : "Enable TTS"}
                >
                  {isSpeechEnabled ? (
                    <Volume2 className="h-4 w-4 text-blue-500" />
                  ) : (
                    <VolumeX className="h-4 w-4" />
                  )}
                </Button>

                {/* Send Button */}
                <Button
                  type="submit"
                  disabled={!input.trim() || isLoading || !hassufficientTokens(10)}
                  size="icon"
                  className="h-8 w-8 flex-shrink-0 rounded-lg"
                  aria-label="Send message"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Footer Text */}
              <div className="flex items-center justify-between mt-2 px-1 text-xs text-muted-foreground">
                <span className="text-[10px] sm:text-xs">Enter to send, Shift+Enter for new line</span>
                <span className="text-[10px] sm:text-xs">{input.length}/1000</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </SuggestionContext.Provider>
  );
}