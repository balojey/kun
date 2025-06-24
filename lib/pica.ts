export interface PicaConnection {
  id: string;
  user_id: string;
  connection_id: string;
  provider: string;
  app_type: string;
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
  { id: 'gmail', name: 'Gmail', icon: '📧', app_type: 'gmail' },
  { id: 'google_calendar', name: 'Google Calendar', icon: '📅', app_type: 'calendar' },
  { id: 'calendar', name: 'Google Calendar', icon: '📅', app_type: 'calendar' },
  { id: 'google_docs', name: 'Google Docs', icon: '📝', app_type: 'docs' },
  { id: 'docs', name: 'Google Docs', icon: '📝', app_type: 'docs' },
  { id: 'google_sheets', name: 'Google Sheets', icon: '📊', app_type: 'sheets' },
  { id: 'sheets', name: 'Google Sheets', icon: '📊', app_type: 'sheets' },
  { id: 'google_drive', name: 'Google Drive', icon: '💾', app_type: 'drive' },
  { id: 'drive', name: 'Google Drive', icon: '💾', app_type: 'drive' },
  { id: 'notion', name: 'Notion', icon: '📝', app_type: 'notion' },
  { id: 'slack', name: 'Slack', icon: '💬', app_type: 'slack' },
  { id: 'github', name: 'GitHub', icon: '🐙', app_type: 'github' },
  { id: 'linear', name: 'Linear', icon: '📊', app_type: 'linear' },
] as const;

export type SupportedProvider = typeof SUPPORTED_PROVIDERS[number]['id'];
export type AppType = typeof SUPPORTED_PROVIDERS[number]['app_type'];

export function getProviderInfo(provider: string) {
  return SUPPORTED_PROVIDERS.find(p => p.id === provider) || {
    id: provider,
    name: provider.charAt(0).toUpperCase() + provider.slice(1),
    icon: '🔗',
    app_type: provider
  };
}

export function getAppTypeFromProvider(provider: string): string {
  const providerInfo = SUPPORTED_PROVIDERS.find(p => p.id === provider);
  return providerInfo?.app_type || provider;
}

export function normalizeProvider(provider: string): string {
  // Normalize provider names to consistent format
  const normalizedMap: Record<string, string> = {
    'google_calendar': 'calendar',
    'google_docs': 'docs',
    'google_sheets': 'sheets',
    'google_drive': 'drive',
  };
  
  return normalizedMap[provider] || provider;
}