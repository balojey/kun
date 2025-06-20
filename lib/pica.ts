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