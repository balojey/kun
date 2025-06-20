'use client';

import { useState, useCallback, useRef } from 'react';
import { createTranscription } from '@/app/actions/create-transcription';
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
      
      console.log('Executing command:', transcript, connections);

      const res = await fetch('/api/pica/sst-tts/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, connections }),
      });
      console.log(1)

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to execute command');
      }
      console.log(2)

      const { result: executeResult } = await res.text().then(text => ({ result: text.trim() }));

      console.log('Command execution result:', executeResult);
      
      setState(prev => ({ ...prev, response: executeResult }));

      // Step 3: Convert response to speech
      setState(prev => ({ ...prev, step: 'speaking' }));
      console.log('Generating speech for response:', executeResult);
      
      const audioUrl = await speak('21m00Tcm4TlvDq8ikWAM', {
        text: executeResult,
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
  }, [connections, speak]);

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