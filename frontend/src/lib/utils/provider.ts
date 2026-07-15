import { OpenAI, Gemini, Claude, Groq, Nvidia} from '@lobehub/icons';
import { Bot } from 'lucide-react';

export const PROVIDER_CONFIG: Record<string, {label: string, icon: any}> = {
  all: {label: "All", icon: Bot},
  openai: {label: "OpenAI", icon: OpenAI},
  google: {label: "Google", icon: Gemini?.Color || Gemini},
  anthropic: {label: "Anthropic", icon: Claude?.Color || Claude},
  groq: {label: "Groq", icon: Groq},
  nvidia: {label: "Nvidia", icon: Nvidia?.Color || Nvidia},
};