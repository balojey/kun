'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { createTranscription } from '@/app/actions/create-transcription';
import { useSpeech } from '@/hooks/use-speech';
import { useConnections } from '@/hooks/use-connections';
import { useAuthContext } from '@/components/auth/auth-provider';
import { createClient } from '@/lib/supabase/client';
import { STT_MODELS, TTS_MODELS } from '@/lib/schemas';
import { toast } from 'sonner';

export type AssistantStep = 
  | 'idle' 
  | 'recording' 
  | 'transcribing' 
  | 'processing' 
  | 'speaking' 
  | 'complete' 
  | 'error';

export interface VoiceLog {
  id: string;
  user_id: string;
  input_type: 'voice' | 'text';
  input_text: string;
  output_text: string;
  created_at: string;
}

export interface AssistantState {
  step: AssistantStep;
  currentInput: string;
  currentResponse: string;
  audioUrl: string | null;
  error: string | null;
  isRecording: boolean;
}

export function useVoiceAssistant() {
  const { user } = useAuthContext();
  const { connections } = useConnections();
  const { speak } = useSpeech();
  const supabase = createClient();

  const [state, setState] = useState<AssistantState>({
    step: 'idle',
    currentInput: '',
    currentResponse: '',
    audioUrl: null,
    error: null,
    isRecording: false,
  });

  const [conversationHistory, setConversationHistory] = useState<VoiceLog[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const connectionsRef = useRef(connections);

  useEffect(() => {
    connectionsRef.current = connections;
  }, [connections]);

  // Load conversation history
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
      setConversationHistory(data || []);
    } catch (error) {
      console.error('Failed to load conversation history:', error);
      toast.error('Failed to load conversation history');
    } finally {
      setIsLoadingHistory(false);
    }
  }, [user, supabase]);

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
      setConversationHistory(prev => [data, ...prev]);
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

  // Load history on mount
  useEffect(() => {
    loadConversationHistory();
  }, [loadConversationHistory]);

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
          setConversationHistory(prev => {
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

  return {
    state,
    conversationHistory,
    isLoadingHistory,
    startRecording,
    stopRecording,
    handleTextInput,
    reset,
    loadConversationHistory,
  };
}