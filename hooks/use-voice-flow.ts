'use client';

import { useState, useCallback, useRef } from 'react';
import { createTranscription } from '@/app/actions/create-transcription';
import { PicaClient, PicaExecuteRequest, PicaTool } from '@/lib/pica';
import { useSpeech } from '@/hooks/use-speech';
import { useConnections } from '@/hooks/use-connections';
import { STT_MODELS, TTS_MODELS } from '@/lib/schemas';
import { toast } from 'sonner';

export type VoiceFlowStep = 
  | 'idle' 
  | 'recording' 
  | 'transcribing' 
  | 'processing' 
  | 'speaking' 
  | 'complete' 
  | 'error';

export interface VoiceFlowState {
  step: VoiceFlowStep;
  transcript: string;
  response: string;
  audioUrl: string | null;
  error: string | null;
}

export function useVoiceFlow() {
  const [state, setState] = useState<VoiceFlowState>({
    step: 'idle',
    transcript: '',
    response: '',
    audioUrl: null,
    error: null,
  });

  const { connections } = useConnections();
  const { speak } = useSpeech();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const picaClient = new PicaClient();

  const startRecording = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, step: 'recording', error: null }));
      
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
        await processAudio(audioBlob);
        
        // Clean up stream
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
    } catch (error) {
      console.error('Error starting recording:', error);
      setState(prev => ({ 
        ...prev, 
        step: 'error', 
        error: 'Failed to start recording. Please check microphone permissions.' 
      }));
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const processAudio = useCallback(async (audioBlob: Blob) => {
    try {
      // Step 1: Transcribe audio
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
      setState(prev => ({ ...prev, transcript }));

      if (!transcript.trim()) {
        throw new Error('No speech detected. Please try again.');
      }

      // Step 2: Process command with PicaOS
      setState(prev => ({ ...prev, step: 'processing' }));
      
      const tools = await picaClient.getTools();
      const parsedCommand = await picaClient.parseCommand(transcript, tools);

      if (!parsedCommand) {
        throw new Error('Could not understand the command. Please try rephrasing.');
      }

      // Find a connection for the required tool
      const tool = tools.find(t => t.id === parsedCommand.tool_id);
      const connection = connections.find(c => c.provider === tool?.provider);

      if (!connection) {
        throw new Error(`Please connect your ${tool?.provider} account first in the Connections page.`);
      }

      const executeRequest: PicaExecuteRequest = {
        ...parsedCommand,
        connection_id: connection.connection_id,
      };

      const executeResult = await picaClient.executeAction(executeRequest);
      
      if (!executeResult.success) {
        throw new Error(executeResult.message || 'Failed to execute command');
      }

      const responseText = executeResult.message || 'Command executed successfully!';
      setState(prev => ({ ...prev, response: responseText }));

      // Step 3: Convert response to speech
      setState(prev => ({ ...prev, step: 'speaking' }));
      
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

      setState(prev => ({ 
        ...prev, 
        step: 'complete', 
        audioUrl: audioUrl || null 
      }));

      toast.success('Voice command completed successfully!');

    } catch (error) {
      console.error('Error processing voice command:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setState(prev => ({ 
        ...prev, 
        step: 'error', 
        error: errorMessage 
      }));
      toast.error(errorMessage);
    }
  }, [connections, speak, picaClient]);

  const reset = useCallback(() => {
    setState({
      step: 'idle',
      transcript: '',
      response: '',
      audioUrl: null,
      error: null,
    });
  }, []);

  return {
    state,
    startRecording,
    stopRecording,
    reset,
    isRecording: state.step === 'recording',
    isProcessing: ['transcribing', 'processing', 'speaking'].includes(state.step),
  };
}