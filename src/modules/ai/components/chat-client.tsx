'use client';

import { ChatEmptySuggestions } from '@/src/modules/ai/components/chat-empty-suggestions';
import { ChatInput } from '@/src/modules/ai/components/chat-input';
import { ChatMessageRenderer } from '@/src/modules/ai/components/chat-message-renderer';
import { ChatModuleSelect } from '@/src/modules/ai/components/chat-module-select';
import { ChatSessionSheet } from '@/src/modules/ai/components/chat-session-sheet';
import { useAiChat } from '@/src/modules/ai/hooks/use-ai-chat';
import {
  useAiSession,
  useCreateAiSession,
} from '@/src/modules/ai/hooks/use-ai-sessions';
import {
  parseModuleChatSlug,
  type AiActionSummary,
  type AiSessionSummary,
  type ChatBlock,
  type ChatMessage,
  type ModuleChatSlug,
} from '@/src/modules/ai/types/chat.types';
import { useAuthGuard } from '@/src/modules/auth';
import { LoadingView } from '@/src/shared/components/layout/loading-view';
import { Button } from '@/src/shared/components/ui/button';
import { APP_ROUTES } from '@/src/shared/constants/app-routes';
import { appToast } from '@/src/shared/lib/app-toast';
import { HistoryIcon, PlusIcon } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type UiMessage = ChatMessage & {
  id: string;
  blocks?: ChatBlock[];
  actions?: AiActionSummary[];
  moduleLabel?: string;
  provider?: string;
  model?: string;
};

function parseModuleParam(value: string | null): ModuleChatSlug {
  return parseModuleChatSlug(value);
}

function parseSessionIdParam(value: string | null): string | null {
  return value && value.length > 0 ? value : null;
}

function parsePromptParam(value: string | null): string | null {
  return value && value.trim().length > 0 ? value.trim() : null;
}

export function ChatClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuthGuard();
  const createSessionMutation = useCreateAiSession();

  const [sessionId, setSessionId] = useState<string | null>(
    parseSessionIdParam(searchParams.get('sessionId')),
  );
  const [moduleSlug, setModuleSlug] = useState<ModuleChatSlug>(
    parseModuleParam(searchParams.get('module')),
  );
  const [draft, setDraft] = useState('');
  const [localMessages, setLocalMessages] = useState<UiMessage[]>([]);
  const [sessionsOpen, setSessionsOpen] = useState(false);
  const isSendingRef = useRef(false);
  const pendingPromptRef = useRef<string | null>(parsePromptParam(searchParams.get('prompt')));
  const promptSentRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const syncModuleContext = useCallback(
    (slug: ModuleChatSlug) => {
      setModuleSlug(slug);
      const params = new URLSearchParams(searchParams.toString());
      params.set('module', slug);
      router.replace(`${APP_ROUTES.app.chat}?${params.toString()}`);
    },
    [router, searchParams],
  );

  const chatMutation = useAiChat((slug) => {
    syncModuleContext(slug);
  });

  const sessionQuery = useAiSession(sessionId);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(APP_ROUTES.auth.login);
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const fromParams = parseSessionIdParam(searchParams.get('sessionId'));
    if (fromParams === sessionId) {
      return;
    }
    setSessionId(fromParams);
    if (!fromParams) {
      setLocalMessages([]);
    }
  }, [searchParams, sessionId]);

  useEffect(() => {
    const moduleParam = searchParams.get('module');
    if (moduleParam) {
      setModuleSlug(parseModuleParam(moduleParam));
    }
  }, [searchParams]);

  useEffect(() => {
    if (isSendingRef.current || !sessionQuery.data?.messages) {
      return;
    }
    const mapped: UiMessage[] = sessionQuery.data.messages
      .filter(
        (m) =>
          (m.role === 'user' || m.role === 'assistant') &&
          m.content.trim().length > 0,
      )
      .map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        actions: m.metadata.actions as AiActionSummary[] | undefined,
        blocks: m.metadata.blocks as ChatBlock[] | undefined,
        moduleLabel:
          typeof m.metadata.moduleLabel === 'string'
            ? m.metadata.moduleLabel
            : undefined,
        provider:
          typeof m.metadata.provider === 'string' ? m.metadata.provider : undefined,
        model: typeof m.metadata.model === 'string' ? m.metadata.model : undefined,
      }));
    if (sessionQuery.data.moduleSlug) {
      syncModuleContext(parseModuleChatSlug(sessionQuery.data.moduleSlug));
    }
    setLocalMessages(mapped);
  }, [sessionQuery.data?.messages, sessionQuery.data?.moduleSlug, syncModuleContext]);

  const displayMessages = useMemo(() => localMessages, [localMessages]);

  const scrollToEnd = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const updateUrlParams = useCallback(
    (patch: { sessionId?: string | null; module?: ModuleChatSlug; prompt?: string }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (patch.module !== undefined) {
        params.set('module', patch.module);
      }
      if (patch.sessionId !== undefined) {
        if (patch.sessionId) {
          params.set('sessionId', patch.sessionId);
        } else {
          params.delete('sessionId');
        }
      }
      if (patch.prompt !== undefined) {
        if (patch.prompt) {
          params.set('prompt', patch.prompt);
        } else {
          params.delete('prompt');
        }
      }
      router.replace(`${APP_ROUTES.app.chat}?${params.toString()}`);
    },
    [router, searchParams],
  );

  const handleNewChat = useCallback(() => {
    setSessionId(null);
    setLocalMessages([]);
    setDraft('');
    updateUrlParams({ sessionId: null, module: moduleSlug, prompt: '' });
  }, [moduleSlug, updateUrlParams]);

  const handleSelectSession = (session: AiSessionSummary) => {
    setSessionId(session.id);
    setModuleSlug((session.moduleSlug as ModuleChatSlug) ?? 'general');
    updateUrlParams({
      sessionId: session.id,
      module: (session.moduleSlug as ModuleChatSlug) ?? 'general',
    });
  };

  const handleModuleChange = useCallback(
    (slug: ModuleChatSlug) => {
      setModuleSlug(slug);
      updateUrlParams({ module: slug });
    },
    [updateUrlParams],
  );

  const sendMessage = useCallback(
    async (textOverride?: string) => {
      const text = (textOverride ?? draft).trim();
      if (
        !text ||
        chatMutation.isPending ||
        createSessionMutation.isPending
      ) {
        return;
      }

      isSendingRef.current = true;

      let activeSessionId = sessionId;
      let assistantId: string | undefined;

      try {
        if (!activeSessionId) {
          const session = await createSessionMutation.mutateAsync({ moduleSlug });
          activeSessionId = session.id;
          setSessionId(activeSessionId);
          updateUrlParams({ sessionId: activeSessionId, module: moduleSlug });
        }

        const userMessage: UiMessage = {
          id: `local-user-${Date.now()}`,
          role: 'user',
          content: text,
        };

        if (!textOverride) {
          setDraft('');
        }

        setLocalMessages((prev) => [...prev, userMessage]);

        const newAssistantId = `local-assistant-${Date.now()}`;
        assistantId = newAssistantId;
        setLocalMessages((prev) => [
          ...prev,
          { id: newAssistantId, role: 'assistant', content: '' },
        ]);

        const response = await chatMutation.mutateAsync({
          sessionId: activeSessionId,
          messages: [{ role: 'user', content: text }],
          onStreamStart: (meta) => {
            setSessionId(meta.sessionId);
            if (meta.moduleSlug) {
              syncModuleContext(meta.moduleSlug);
            }
            setLocalMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? {
                    ...m,
                    moduleLabel: meta.moduleLabel,
                    provider: meta.provider,
                    model: meta.model,
                  }
                  : m,
              ),
            );
          },
          onModuleContext: syncModuleContext,
          onStreamStatus: (message) => {
            setLocalMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, content: message } : m)),
            );
          },
          onStreamChunk: (content) => {
            setLocalMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, content } : m)),
            );
            scrollToEnd();
          },
        });

        setSessionId(response.sessionId);
        setLocalMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                ...m,
                content: response.content,
                actions: response.actions,
                blocks: response.blocks,
                moduleLabel: response.moduleLabel,
                provider: response.provider,
                model: response.model,
              }
              : m,
          ),
        );
      } catch (error) {
        if (assistantId) {
          setLocalMessages((prev) => prev.filter((m) => m.id !== assistantId));
        }
        appToast.error({
          text1: 'No se pudo enviar el mensaje',
          text2: error instanceof Error ? error.message : 'Error desconocido',
        });
      } finally {
        isSendingRef.current = false;
      }
    },
    [
      draft,
      sessionId,
      moduleSlug,
      chatMutation,
      createSessionMutation,
      scrollToEnd,
      syncModuleContext,
      updateUrlParams,
    ],
  );

  useEffect(() => {
    const prompt = parsePromptParam(searchParams.get('prompt'));
    if (!prompt) return;
    pendingPromptRef.current = prompt;
    promptSentRef.current = false;
  }, [searchParams]);

  useEffect(() => {
    if (promptSentRef.current || !pendingPromptRef.current) return;
    if (chatMutation.isPending || createSessionMutation.isPending) return;
    if (sessionId && sessionQuery.isLoading) return;

    const prompt = pendingPromptRef.current;
    promptSentRef.current = true;
    pendingPromptRef.current = null;
    updateUrlParams({ prompt: '' });
    void sendMessage(prompt);
  }, [
    sessionId,
    sessionQuery.isLoading,
    chatMutation.isPending,
    createSessionMutation.isPending,
    sendMessage,
    searchParams,
    updateUrlParams,
  ]);

  useEffect(() => {
    scrollToEnd();
  }, [displayMessages.length, scrollToEnd]);

  const isLoadingExistingSession =
    Boolean(sessionId) &&
    sessionQuery.isLoading &&
    displayMessages.length === 0 &&
    !chatMutation.isPending;

  if (isLoading || !isAuthenticated) {
    return <LoadingView variant="screen" />;
  }

  if (isLoadingExistingSession) {
    return <LoadingView variant="screen" />;
  }

  return (
    <div className="flex h-[calc(100dvh-var(--header-height,3.5rem))] flex-col">
      <div className="flex flex-row items-center justify-between gap-2 border-b border-border px-4 py-2">
        <div className="min-w-0 flex-1">
          <ChatModuleSelect
            value={moduleSlug}
            disabled={chatMutation.isPending}
            onChange={handleModuleChange}
          />
        </div>
        <div className="flex shrink-0 flex-row gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setSessionsOpen(true)}
            aria-label="Historial de conversaciones"
          >
            <HistoryIcon />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => void handleNewChat()}
            aria-label="Nueva conversación"
          >
            <PlusIcon />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2">
        {displayMessages.length === 0 ? (
          <ChatEmptySuggestions
            moduleSlug={moduleSlug}
            disabled={chatMutation.isPending || createSessionMutation.isPending}
            onSelect={(prompt) => void sendMessage(prompt)}
          />
        ) : (
          <div className="flex flex-col">
            {displayMessages.map((item) => (
              <ChatMessageRenderer
                key={item.id}
                role={item.role}
                content={item.content || '…'}
                blocks={item.blocks}
                actions={item.actions}
                moduleLabel={item.moduleLabel}
                provider={item.provider}
                model={item.model}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <ChatInput
        value={draft}
        onChange={setDraft}
        onSend={() => void sendMessage()}
        disabled={chatMutation.isPending || createSessionMutation.isPending}
      />

      <ChatSessionSheet
        open={sessionsOpen}
        onOpenChange={setSessionsOpen}
        activeSessionId={sessionId}
        onSelectSession={handleSelectSession}
        onNewChat={() => void handleNewChat()}
      />
    </div>
  );
}
