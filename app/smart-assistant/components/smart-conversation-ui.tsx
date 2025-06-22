'use client';

import { useConversation } from '@elevenlabs/react';
import { Loader2, Mic, PhoneOff, Terminal } from 'lucide-react';
import { useCallback, useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';

import { createTranscription } from '@/app/actions/create-transcription';
import { useSpeech } from '@/hooks/use-speech';
import { useConnections } from '@/hooks/use-connections';
import { useAuthContext } from '@/components/auth/auth-provider';
import { createClient } from '@/lib/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { STT_MODELS, TTS_MODELS } from '@/lib/schemas';
import { VoiceInput } from '@/components/voice-assistant/voice-input';
import { CurrentInteraction } from '@/components/voice-assistant/current-interaction';
import { ConversationHistory } from '@/components/voice-assistant/conversation-history';
import { VoiceLog, AssistantState } from '@/types/assistantTypes';

export default function SmartConversationUI() {
  const { user } = useAuthContext();
  const { connections } = useConnections();
  const { speak } = useSpeech();
  const supabase = createClient();

  // Voice/Text input state
  const [conversation1History, setConversation1History] = useState<VoiceLog[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const connectionsRef = useRef(connections);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [state, setState] = useState<AssistantState>({
    step: 'idle',
    currentInput: '',
    currentResponse: '',
    audioUrl: null,
    error: null,
    isRecording: false,
  });

  useEffect(() => {
    connectionsRef.current = connections;
  }, [connections]);
  

  const conversation = useConversation({
    onConnect: () => toast.info('Connected to agent'),
    onDisconnect: () => toast.info('Disconnected from agent'),
    onMessage: (message) => toast.info(`Message: ${message.message}`),
    onError: (error) => toast.error(`Error: ${error}`),
  });

  const loadConversationHistory = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoadingHistory(true);
      const { data, error } = await supabase
        .from('voice_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setConversation1History(data || []);
    } catch (error) {
      console.error('Failed to load conversation history:', error);
      toast.error('Failed to load conversation history');
    } finally {
      setIsLoadingHistory(false);
    }
  }, [user, supabase]);

  // Load history on mount
  useEffect(() => {
    loadConversationHistory();
  }, [loadConversationHistory]);

  // Save interaction to database
  const saveInteraction = useCallback(async (
    inputType: 'voice' | 'text',
    inputText: string,
    outputText: string
  ) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('voice_logs')
        .insert({
          user_id: user.id,
          input_type: inputType,
          input_text: inputText,
          output_text: outputText,
        })
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      setConversation1History(prev => [data, ...prev]);
    } catch (error) {
      console.error('Failed to save interaction:', error);
      // Don't show error to user as this is background operation
    }
  }, [user, supabase]);

  // Process input (voice or text)
  const processInput = useCallback(async (inputText: string, inputType: 'voice' | 'text') => {
    try {
      setState(prev => ({ 
        ...prev, 
        step: 'processing', 
        currentInput: inputText,
        error: null 
      }));

      // Send to PicaOS
      const res = await fetch('/api/pica/sst-tts/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          transcript: inputText, 
          connectionIds: connectionsRef.current.map(c => c.connection_id) 
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to execute command');
      }

      const responseText = await res.text();
      const cleanResponse = responseText.trim();

      setState(prev => ({ ...prev, currentResponse: cleanResponse }));

      // Convert response to speech
      setState(prev => ({ ...prev, step: 'speaking' }));
      
      const audioUrl = await speak('21m00Tcm4TlvDq8ikWAM', {
        text: cleanResponse,
        modelId: TTS_MODELS.FLASH,
        voiceSettings: {
          stability: 0.5,
          similarityBoost: 0.75,
          style: 0,
          speed: 1.0,
          useSpeakerBoost: false,
        },
      });

      setState(prev => ({ 
        ...prev, 
        step: 'complete', 
        audioUrl: audioUrl || null 
      }));

      // Save to database
      await saveInteraction(inputType, inputText, cleanResponse);

      toast.success('Command completed successfully!');

    } catch (error) {
      console.error('Error processing input:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setState(prev => ({ 
        ...prev, 
        step: 'error', 
        error: errorMessage 
      }));
      toast.error(errorMessage);
    }
  }, [speak, saveInteraction]);

  // Handle text input
  const handleTextInput = useCallback(async (text: string) => {
    if (!text.trim()) return;
    await processInput(text.trim(), 'text');
  }, [processInput]);

  // Voice recording functions
  const startRecording = useCallback(async () => {
    try {
      setState(prev => ({ 
        ...prev, 
        step: 'recording', 
        isRecording: true,
        error: null 
      }));
      
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
        
        // Clean up stream
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
    } catch (error) {
      console.error('Error starting recording:', error);
      setState(prev => ({ 
        ...prev, 
        step: 'error',
        isRecording: false,
        error: 'Failed to start recording. Please check microphone permissions.' 
      }));
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      setState(prev => ({ ...prev, isRecording: false }));
      mediaRecorderRef.current.stop();
    }
  }, []);

  const processVoiceInput = useCallback(async (audioBlob: Blob) => {
    try {
      // Transcribe audio
      setState(prev => ({ ...prev, step: 'transcribing' }));
      
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

      // Process the transcribed text
      await processInput(transcript, 'voice');

    } catch (error) {
      console.error('Error processing voice input:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setState(prev => ({ 
        ...prev, 
        step: 'error', 
        error: errorMessage 
      }));
      toast.error(errorMessage);
    }
  }, [processInput]);

  const reset = useCallback(() => {
    setState({
      step: 'idle',
      currentInput: '',
      currentResponse: '',
      audioUrl: null,
      error: null,
      isRecording: false,
    });
  }, []);

  // Set up real-time subscription for new voice logs
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('voice_logs_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'voice_logs',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // Only add if it's not already in our local state (to avoid duplicates)
          setConversation1History(prev => {
            const exists = prev.some(log => log.id === payload.new.id);
            if (!exists) {
              return [payload.new as VoiceLog, ...prev];
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, supabase]);

  const startConversation = useCallback(async () => {
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Start the conversation with your agent
      const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
      if (!agentId) {
        throw new Error('Agent ID is not defined');
      }
      await conversation.startSession({
        agentId,
      });

    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

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

      {/* Input Interface */}
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

      {/* Current Interaction */}
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Conversation History</h2>
          <p className="text-muted-foreground text-sm">
            Your recent interactions with the assistant
          </p>
        </div>

        <ConversationHistory 
          history={conversation1History} 
          isLoading={isLoadingHistory} 
        />
      </div>

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