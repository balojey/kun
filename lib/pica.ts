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

export interface PicaTool {
  id: string;
  name: string;
  description: string;
  provider: string;
  actions: PicaAction[];
}

export interface PicaAction {
  id: string;
  name: string;
  description: string;
  parameters: PicaParameter[];
}

export interface PicaParameter {
  name: string;
  type: string;
  description: string;
  required: boolean;
}

export interface PicaExecuteRequest {
  tool_id: string;
  action_id: string;
  parameters: Record<string, any>;
  connection_id: string;
}

export interface PicaExecuteResponse {
  success: boolean;
  result: any;
  message: string;
  execution_time_ms: number;
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

// PicaOS API client functions
export class PicaClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || env.PICA_SANDBOX_API_KEY || '';
    this.baseUrl = 'https://api.pica.ai/v1'; // Placeholder URL - replace with actual PicaOS API
  }

  async getTools(): Promise<PicaTool[]> {
    try {
      const response = await fetch(`${this.baseUrl}/tools`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch tools: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching tools:', error);
      return [];
    }
  }

  async executeAction(request: PicaExecuteRequest): Promise<PicaExecuteResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/tools/execute`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Failed to execute action: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error executing action:', error);
      throw error;
    }
  }

  // Parse natural language commands and map to tool actions
  async parseCommand(command: string, availableTools: PicaTool[]): Promise<{
    tool_id: string;
    action_id: string;
    parameters: Record<string, any>;
  } | null> {
    // Simple command parsing logic - in production, this would use NLP/LLM
    const lowerCommand = command.toLowerCase();

    // Gmail commands
    if (lowerCommand.includes('send email') || lowerCommand.includes('email')) {
      const gmailTool = availableTools.find(t => t.provider === 'gmail');
      if (gmailTool) {
        const sendAction = gmailTool.actions.find(a => a.name.toLowerCase().includes('send'));
        if (sendAction) {
          // Extract email details from command (simplified)
          const emailMatch = lowerCommand.match(/to ([^\s]+@[^\s]+)/);
          const subjectMatch = lowerCommand.match(/subject (.+?) body/);
          const bodyMatch = lowerCommand.match(/body (.+)/);

          return {
            tool_id: gmailTool.id,
            action_id: sendAction.id,
            parameters: {
              to: emailMatch?.[1] || '',
              subject: subjectMatch?.[1] || 'Voice Command Email',
              body: bodyMatch?.[1] || command,
            },
          };
        }
      }
    }

    // Calendar commands
    if (lowerCommand.includes('create event') || lowerCommand.includes('schedule')) {
      const calendarTool = availableTools.find(t => t.provider === 'calendar');
      if (calendarTool) {
        const createAction = calendarTool.actions.find(a => a.name.toLowerCase().includes('create'));
        if (createAction) {
          return {
            tool_id: calendarTool.id,
            action_id: createAction.id,
            parameters: {
              title: command,
              description: `Created via voice command: ${command}`,
            },
          };
        }
      }
    }

    // Notion commands
    if (lowerCommand.includes('create note') || lowerCommand.includes('add to notion')) {
      const notionTool = availableTools.find(t => t.provider === 'notion');
      if (notionTool) {
        const createAction = notionTool.actions.find(a => a.name.toLowerCase().includes('create'));
        if (createAction) {
          return {
            tool_id: notionTool.id,
            action_id: createAction.id,
            parameters: {
              title: 'Voice Note',
              content: command,
            },
          };
        }
      }
    }

    return null;
  }
}