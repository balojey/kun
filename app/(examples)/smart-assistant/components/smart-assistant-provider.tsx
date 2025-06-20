'use client';

import { AgentSummaryResponseModel } from '@elevenlabs/elevenlabs-js/api';
import { createContext, ReactNode, useContext } from 'react';

interface SmartAssistantContextType {
  agents: AgentSummaryResponseModel[];
  error: string | null;
}

const SmartAssistantContext = createContext<SmartAssistantContextType | null>(null);

export function useSmartAssistant() {
  const context = useContext(SmartAssistantContext);
  if (!context) {
    throw new Error('useSmartAssistant must be used within a SmartAssistantProvider');
  }
  return context;
}

interface SmartAssistantProviderProps {
  children: ReactNode;
  agents: AgentSummaryResponseModel[];
  error: string | null;
}

export default function SmartAssistantProvider({
  children,
  agents,
  error,
}: SmartAssistantProviderProps) {
  return (
    <SmartAssistantContext.Provider value={{ agents, error }}>
      {children}
    </SmartAssistantContext.Provider>
  );
}