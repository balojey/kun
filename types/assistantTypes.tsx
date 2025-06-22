export type AssistantStep = 
  | 'idle' 
  | 'recording' 
  | 'transcribing' 
  | 'processing' 
  | 'speaking' 
  | 'complete' 
  | 'error';

export interface AssistantState {
  step: AssistantStep;
  currentInput: string;
  currentResponse: string;
  audioUrl: string | null;
  error: string | null;
  isRecording: boolean;
}

export interface VoiceLog {
  id: string;
  user_id: string;
  input_type: 'voice' | 'text';
  input_text: string;
  output_text: string;
  created_at: string;
}