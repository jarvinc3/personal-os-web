export type ChatRole = 'user' | 'assistant' | 'system' | 'tool';

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type AiProviderInfo = {
  name: string;
  model: string;
};

export type SideEffectDescriptor =
  | { type: 'invalidate'; keys: string[] }
  | { type: 'theme'; value: 'system' | 'light' | 'dark' }
  | { type: 'moduleContext'; slug: ModuleChatSlug; label: string };

export type AiActionSummary = {
  id: string;
  actionType: string;
  targetModule: string;
  payload: Record<string, unknown>;
  status: string;
  label?: string;
};

export type ChatBlock =
  | { type: 'markdown'; content: string }
  | { type: 'action'; action: AiActionSummary };

export type ChatResponse = {
  sessionId: string;
  provider: string;
  model: string;
  moduleSlug: ModuleChatSlug;
  moduleLabel: string;
  content: string;
  requiresConfirmation?: boolean;
  actions?: AiActionSummary[];
  sideEffects?: SideEffectDescriptor[];
  blocks?: ChatBlock[];
};

export type ChatStreamEvent =
  | {
    type: 'start';
    sessionId: string;
    provider: string;
    model: string;
    moduleSlug?: ModuleChatSlug;
    moduleLabel?: string;
    requiresConfirmation?: boolean;
    actions?: AiActionSummary[];
  }
  | { type: 'chunk'; content: string }
  | { type: 'reset' }
  | { type: 'status'; message: string }
  | {
    type: 'done';
    sessionId: string;
    provider: string;
    model: string;
    moduleSlug?: ModuleChatSlug;
    moduleLabel?: string;
    requiresConfirmation?: boolean;
    actions?: AiActionSummary[];
    sideEffects?: SideEffectDescriptor[];
    blocks?: ChatBlock[];
  }
  | { type: 'error'; message: string };

export type AiSessionSummary = {
  id: string;
  contextType: string;
  moduleId?: string | null;
  moduleSlug?: string | null;
  title?: string | null;
  lastActiveAt: string;
  createdAt: string;
  preview: string | null;
};

export type AiSessionMessage = {
  id: string;
  role: ChatRole;
  content: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type AiSessionDetail = {
  id: string;
  contextType: string;
  moduleId?: string | null;
  moduleSlug?: string | null;
  title?: string | null;
  memorySnapshot?: Record<string, unknown>;
  lastActiveAt: string;
  createdAt: string;
  messages: AiSessionMessage[];
};

export type PaginatedAiSessions = {
  items: AiSessionSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type AiResponseWsPayload = {
  type: 'chat.complete' | 'chat.chunk' | 'insight' | 'action.updated';
  sessionId?: string;
  provider?: string;
  model?: string;
  content?: string;
  stream?: boolean;
  actions?: AiActionSummary[];
  sideEffects?: SideEffectDescriptor[];
  actionType?: string;
  source?: string;
  requiresConfirmation?: boolean;
};

export type ModuleChatSlug =
  | 'general'
  | 'agenda'
  | 'projects'
  | 'health'
  | 'subscriptions'
  | 'finance';

export function getChatModuleLabel(slug: string | undefined | null): string {
  const key = (slug ?? 'general') as ModuleChatSlug;
  return CHAT_MODULE_OPTIONS.find((option) => option.slug === key)?.label ?? 'General';
}

export function parseModuleChatSlug(slug: string | undefined | null): ModuleChatSlug {
  if (slug && CHAT_MODULE_OPTIONS.some((option) => option.slug === slug)) {
    return slug as ModuleChatSlug;
  }
  return 'general';
}

export const CHAT_MODULE_OPTIONS: { slug: ModuleChatSlug; label: string }[] = [
  { slug: 'general', label: 'General' },
  { slug: 'agenda', label: 'Agenda' },
  { slug: 'projects', label: 'Proyectos' },
  { slug: 'health', label: 'Salud' },
  { slug: 'subscriptions', label: 'Suscripciones' },
  { slug: 'finance', label: 'Finanzas' },
];
