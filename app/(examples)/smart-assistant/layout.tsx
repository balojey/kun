import { Metadata } from 'next';

import SmartAssistantProvider from '@/app/(examples)/smart-assistant/components/smart-assistant-provider';
import { getAgents } from '@/app/actions/manage-agents';

export const metadata: Metadata = {
  title: 'Smart Assistant',
  description: 'Interact with your connected tools using conversational AI',
};

export default async function Layout({ children }: { children: React.ReactNode }) {
  const agentsResult = await getAgents();

  const sortedAgents = agentsResult.ok
    ? [...agentsResult.value.agents].sort((a, b) => b.createdAtUnixSecs - a.createdAtUnixSecs)
    : [];

  return (
    <SmartAssistantProvider
      agents={sortedAgents}
      error={!agentsResult.ok ? agentsResult.error : null}
    >
      {children}
    </SmartAssistantProvider>
  );
}