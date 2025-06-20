import { AudioLines, MessageSquareQuote, MessagesSquare, Sparkles, Settings, Mic, Brain } from 'lucide-react';
import type { ComponentType } from 'react';

type Demo = {
  name: string;
  slug: string;
  disabled?: boolean;
  icon?: ComponentType<{ className?: string }>;
  description?: string;
};

export const demos: { name: string; items: Demo[] }[] = [
  {
    name: 'Capabilities',
    items: [
      {
        name: 'Smart Assistant',
        icon: Brain,
        slug: 'smart-assistant',
        description: 'Conversational AI assistant that controls your connected tools.',
      },
      {
        name: 'Voice Actions',
        icon: Mic,
        slug: 'voice-action',
        description: 'Control your tools with voice commands.',
      },
      {
        name: 'Text to speech',
        icon: MessageSquareQuote,
        slug: 'text-to-speech',
        description: 'Convert text to natural-sounding speech.',
      },
      {
        name: 'Speech to text',
        icon: AudioLines,
        slug: 'speech-to-text',
        description: 'Transcribe audio and video files with high accuracy.',
      },
      {
        name: 'Sound effects',
        icon: Sparkles,
        slug: 'sound-effects',
        description: 'Turn text into cinematic sound effects.',
      },
      {
        name: 'Conversational AI',
        icon: MessagesSquare,
        slug: 'conversational-ai',
        description: 'Build life-like conversational agents.',
      },
    ],
  },
  {
    name: 'Integrations',
    items: [
      {
        name: 'Connected Tools',
        icon: Settings,
        slug: 'connections',
        description: 'Manage your connected tools and integrations.',
      },
    ],
  },
];

export function findDemoBySlug(slug: string): (Demo & { category: string }) | undefined {
  for (const section of demos) {
    const item = section.items.find((item) => item.slug === slug);
    if (item) {
      return { ...item, category: section.name };
    }
  }
  return undefined;
}