'use client';

import type { GetAgentResponseModel } from '@elevenlabs/elevenlabs-js/api';
import { useConversation } from '@elevenlabs/react';
import { AlertCircle, Info, Loader2, Mic, PhoneOff, Terminal, Type, Send } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { useSmartAssistant } from './smart-assistant-provider';
import { getAgent, getAgentSignedUrl } from '@/app/actions/manage-agents';
import { createTranscription } from '@/app/actions/create-transcription';
import { useSpeech } from '@/hooks/use-speech';
import { useConnections } from '@/hooks/use-connections';
import { useAuthContext } from '@/components/auth/auth-provider';
import { createClient } from '@/lib/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { STT_MODELS, TTS_MODELS } from '@/lib/schemas';

interface VoiceLog {
  id: string;
  user_id: string;
  input_type: 'voice' | 'text';
  input_text: string;
  output_text: string;
  created_at: string;
}

export default function SmartConversationUI() {
  const { agents } = useSmartAssistant();
  const { user } = useAuthContext();
  const { connections } = useConnections();
  const { speak } = useSpeech();
  const supabase = createClient();
  const searchParams = useSearchParams();
  const agentIdFromUrl = searchParams.get('agent_id');

  const [selectedAgent, setSelectedAgent] = useState<string | null>(
    agentIdFromUrl || (agents.length > 0 ? agents[0].agentId : null)
  );

  const [agentDetails, setAgentDetails] = useState<GetAgentResponseModel | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editablePrompt, setEditablePrompt] = useState<string>('');
  const [editableFirstMessage, setEditableFirstMessage] = useState<string>('');

  // Voice/Text input state
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');
  const [textInput, setTextInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [currentResponse, setCurrentResponse] = useState('');
  const [conversation1History, setConversation1History] = useState<VoiceLog[]>([]);

  const conversation = useConversation({
    onConnect: () => toast.info('Connected to agent'),
    onDisconnect: () => toast.info('Disconnected from agent'),
    onMessage: (message) => toast.info(`Message: ${message.message}`),
    onError: (error) => toast.error(`Error: ${error}`),
  });

  useEffect(() => {
    if (agentIdFromUrl) {
      setSelectedAgent(agentIdFromUrl);
    }
  }, [agentIdFromUrl]);

  useEffect(() => {
    let isMounted = true;

    if (selectedAgent) {
      setIsLoadingDetails(true);
      setLoadError(null);

      getAgent(selectedAgent)
        .then((result) => {
          if (!isMounted) return;

          if (result.ok) {
            setAgentDetails(result.value);
            
            // Set up PicaOS-aware prompt
            const basePrompt = result.value.conversationConfig?.agent?.prompt?.prompt || '';
            const picaPrompt = `${basePrompt}

You are a smart assistant that can help users control their connected tools and services. The user has the following tools connected: ${connections.map(c => c.provider).join(', ')}.

When the user asks you to perform actions with their tools (like sending emails, creating calendar events, adding notes, etc.), you should:
1. Acknowledge their request
2. Explain what action you would take
3. Provide a helpful response

For example:
- "Send an email to john@example.com" → "I'll send an email to john@example.com for you."
- "Create a calendar event for tomorrow" → "I'll create a calendar event for tomorrow."
- "Add this to my notes" → "I'll add that to your notes."

Be conversational, helpful, and act as if you can actually perform these actions.`;

            setEditablePrompt(picaPrompt);
            setEditableFirstMessage(result.value.conversationConfig?.agent?.firstMessage || 'Hello! I\'m your smart assistant. I can help you control your connected tools through voice or text. What would you like me to do?');
            setLoadError(null);
          } else {
            console.error('Failed to load agent details:', result.error);
            setLoadError(result.error || 'Failed to load agent details');
          }
        })
        .catch((error) => {
          if (!isMounted) return;
          setLoadError('An unexpected error occurred');
          console.error('Error loading agent:', error);
        })
        .finally(() => {
          if (isMounted) {
            setIsLoadingDetails(false);
          }
        });
    }

    return () => {
      isMounted = false;
    };
  }, [selectedAgent, connections]);

  // Load conversation history
  useEffect(() => {
    if (!user) return;

    const loadHistory = async () => {
      try {
        const { data, error } = await supabase
          .from('voice_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;
        setConversation1History(data || []);
      } catch (error) {
        console.error('Failed to load conversation history:', error);
      }
    };

    loadHistory();
  }, [user, supabase]);

  const handleAgentResponse = async (responseText: string) => {
    setCurrentResponse(responseText);
    
    // Convert to speech if we're in voice mode
    if (inputMode === 'voice') {
      try {
        const audioUrl = await speak('21m00Tcm4TlvDq8ikWAM', {
          text: responseText,
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

    // Save to database
    if (user && currentTranscript) {
      try {
        const { data, error } = await supabase
          .from('voice_logs')
          .insert({
            user_id: user.id,
            input_type: inputMode,
            input_text: currentTranscript,
            output_text: responseText,
          })
          .select()
          .single();

        if (!error && data) {
          setConversation1History(prev => [data, ...prev]);
        }
      } catch (error) {
        console.error('Failed to save interaction:', error);
      }
    }

    setIsProcessing(false);
  };

  const startConversation = useCallback(async () => {
    if (!selectedAgent) return;

    try {
      const signedUrlResult = await getAgentSignedUrl({
        agentId: selectedAgent,
      });

      if (!signedUrlResult.ok) {
        console.error('Failed to get signed URL:', signedUrlResult.error);
        return;
      }
      console.log(`Signed URL: ${signedUrlResult.ok ? signedUrlResult.value.signedUrl : 'N/A'}`);

      await conversation.startSession({
        signedUrl: signedUrlResult.value.signedUrl,
        overrides: {
          agent: {
            prompt: {
              prompt: editablePrompt,
            },
            firstMessage: editableFirstMessage,
          },
        },
      });
    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
    console.log('Conversation started with agent:', selectedAgent);
  }, [conversation, selectedAgent, editablePrompt, editableFirstMessage]);

  const stopConversation = useCallback(async () => {
    console.log('Stopping conversation...');
    await conversation.endSession();
  }, [conversation]);

  const handleVoiceInput = async () => {
    if (isRecording) {
      // Stop recording logic would go here
      setIsRecording(false);
      return;
    }

    try {
      setIsRecording(true);
      setIsProcessing(true);
      
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        
        try {
          // Transcribe with ElevenLabs
          const audioFile = new File([audioBlob], 'recording.wav', { type: 'audio/wav' });
          const transcriptionResult = await createTranscription({
            file: audioFile,
            modelId: STT_MODELS.SCRIBE_V1,
            timestampsGranularity: 'none',
            tagAudioEvents: false,
            diarize: false,
          });

          if (transcriptionResult.ok && transcriptionResult.value.text) {
            const transcript = transcriptionResult.value.text;
            setCurrentTranscript(transcript);
            
            // Send to conversational AI
            if (conversation.status === 'connected') {
              await conversation.sendUserMessage(transcript);
            } else {
              // Fallback to PicaOS if conversation not connected
              await handlePicaOSFallback(transcript);
            }
          } else {
            throw new Error('No speech detected');
          }
        } catch (error) {
          console.error('Transcription error:', error);
          toast.error('Failed to process voice input');
          setIsProcessing(false);
        }
        
        // Clean up
        stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
      };

      mediaRecorder.start();
      
      // Auto-stop after 10 seconds
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, 10000);

    } catch (error) {
      console.error('Voice input error:', error);
      toast.error('Failed to access microphone');
      setIsRecording(false);
      setIsProcessing(false);
    }
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || isProcessing) return;

    setIsProcessing(true);
    setCurrentTranscript(textInput);
    
    try {
      if (conversation.status === 'connected') {
        await conversation.sendUserMessage(textInput);
      } else {
        await handlePicaOSFallback(textInput);
      }
      setTextInput('');
    } catch (error) {
      console.error('Text input error:', error);
      toast.error('Failed to process text input');
      setIsProcessing(false);
    }
  };

  const handlePicaOSFallback = async (input: string) => {
    try {
      const res = await fetch('/api/pica/sst-tts/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          transcript: input, 
          connectionIds: connections.map(c => c.connection_id) 
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to execute command');
      }

      const responseText = await res.text();
      await handleAgentResponse(responseText.trim());
    } catch (error) {
      console.error('PicaOS fallback error:', error);
      await handleAgentResponse("I'm sorry, I couldn't process that request right now. Please try again.");
    }
  };

  if (isLoadingDetails) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-muted-foreground">Loading smart assistant...</p>
      </div>
    );
  }

  if (loadError && !agentDetails) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading Assistant</AlertTitle>
        <AlertDescription>{loadError}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Smart Assistant</h1>
        <p className="text-muted-foreground">
          Interact with your connected tools using voice or text
        </p>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Assistant Status</span>
            <div className="flex gap-2">
              <Badge variant={conversation.status === 'connected' ? 'default' : 'secondary'}>
                {conversation.status === 'connected' ? 'AI Connected' : 'AI Disconnected'}
              </Badge>
              <Badge variant={connections.length > 0 ? 'default' : 'outline'}>
                {connections.length} Tools Connected
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              onClick={conversation.status === 'connected' ? stopConversation : startConversation}
              disabled={conversation.status === 'connecting'}
              variant={conversation.status === 'connected' ? 'secondary' : 'default'}
            >
              {conversation.status === 'connecting' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : conversation.status === 'connected' ? (
                <>
                  <PhoneOff className="mr-2 h-4 w-4" />
                  Disconnect AI
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-4 w-4" />
                  Connect AI
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Input Mode Toggle */}
      <div className="flex justify-center">
        <div className="flex bg-muted rounded-lg p-1">
          <Button
            variant={inputMode === 'voice' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setInputMode('voice')}
            className="flex items-center gap-2"
          >
            <Mic className="h-4 w-4" />
            Voice
          </Button>
          <Button
            variant={inputMode === 'text' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setInputMode('text')}
            className="flex items-center gap-2"
          >
            <Type className="h-4 w-4" />
            Text
          </Button>
        </div>
      </div>

      {/* Input Interface */}
      <Card>
        <CardContent className="pt-6">
          {inputMode === 'voice' ? (
            <div className="flex flex-col items-center space-y-4">
              <Button
                size="lg"
                variant={isRecording ? "destructive" : "default"}
                className={`h-20 w-20 rounded-full transition-all duration-200 ${
                  isRecording ? 'animate-pulse scale-110' : ''
                }`}
                onClick={handleVoiceInput}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : isRecording ? (
                  <Mic className="h-8 w-8" />
                ) : (
                  <Mic className="h-8 w-8" />
                )}
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                {isRecording 
                  ? 'Listening... Click to stop' 
                  : isProcessing
                  ? 'Processing...'
                  : 'Click to start voice input'
                }
              </p>
            </div>
          ) : (
            <form onSubmit={handleTextSubmit} className="flex gap-2">
              <Input
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Type your command or question..."
                disabled={isProcessing}
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={!textInput.trim() || isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          )}
          {/* <VoiceInput
            step={state.step}
            isRecording={state.isRecording}
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
            onTextSubmit={handleTextInput}
          /> */}

          {/* Error Display */}
          {/* {state.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )} */}

          {/* Current Interaction */}
          {/* <CurrentInteraction state={state} onReset={reset} /> */}
        </CardContent>
      </Card>

      {/* Current Interaction */}
      {(currentTranscript || currentResponse) && (
        <Card>
          <CardHeader>
            <CardTitle>Current Interaction</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentTranscript && (
              <div>
                <p className="font-medium text-sm mb-1">You said:</p>
                <p className="text-sm text-muted-foreground">{currentTranscript}</p>
              </div>
            )}
            {currentResponse && (
              <div>
                <p className="font-medium text-sm mb-1">Assistant:</p>
                <p className="text-sm text-muted-foreground">{currentResponse}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Conversations */}
      {conversation1History.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Conversations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {conversation1History.slice(0, 5).map((log) => (
                <div key={log.id} className="border-l-2 border-muted pl-4 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {log.input_type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm">{log.input_text}</p>
                  <p className="text-sm text-muted-foreground">{log.output_text}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {/* <div className="space-y-4">
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
      </div> */}

      {/* Instructions */}
      <Alert>
        <Terminal className="h-4 w-4" />
        <AlertTitle>How to Use</AlertTitle>
        <AlertDescription>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Connect to the AI assistant for natural conversations</li>
            <li>Use voice input for hands-free interaction</li>
            <li>Use text input for precise commands</li>
            <li>The assistant can control your connected tools: {connections.map(c => c.provider).join(', ')}</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}