import { env } from '@/env.mjs';

export interface PicaConnection {
  id: string;
  user_id: string;
  connection_id: string;
  provider: string;
  created_at: string;
  updated_at: string;
}

export interface PicaAuthKitConfig {
  apiKey: string;
  userId: string;
  onSuccess?: (connectionId: string, provider: string) => void;
  onError?: (error: string) => void;
  onClose?: () => void;
}

export const SUPPORTED_PROVIDERS = [
  { id: 'gmail', name: 'Gmail', icon: '📧' },
  { id: 'notion', name: 'Notion', icon: '📝' },
  { id: 'calendar', name: 'Google Calendar', icon: '📅' },
  { id: 'slack', name: 'Slack', icon: '💬' },
  { id: 'github', name: 'GitHub', icon: '🐙' },
  { id: 'linear', name: 'Linear', icon: '📊' },
] as const;

export type SupportedProvider = typeof SUPPORTED_PROVIDERS[number]['id'];

export function getProviderInfo(provider: string) {
  return SUPPORTED_PROVIDERS.find(p => p.id === provider) || {
    id: provider,
    name: provider.charAt(0).toUpperCase() + provider.slice(1),
    icon: '🔗'
  };
}

export async function generateAuthKitToken(userId: string): Promise<string> {
  const response = await fetch('/api/authkit-token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate AuthKit token');
  }

  const data = await response.json();
  return data.token;
}

export async function revokeConnection(connectionId: string): Promise<boolean> {
  try {
    // In a real implementation, you would call PicaOS API to revoke the connection
    // For now, we'll just return true to indicate success
    console.log(`Revoking connection: ${connectionId}`);
    return true;
  } catch (error) {
    console.error('Failed to revoke connection:', error);
    return false;
  }
}