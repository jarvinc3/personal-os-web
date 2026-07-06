'use client';

import { ChatActionCard } from '@/src/modules/ai/components/chat-action-card';
import { ChatMarkdownBlock } from '@/src/modules/ai/components/chat-markdown-block';
import type { AiActionSummary, ChatBlock, ChatRole } from '@/src/modules/ai/types/chat.types';
import { cn } from '@/src/shared/lib/utils';

type ChatMessageRendererProps = {
  role: ChatRole;
  content: string;
  blocks?: ChatBlock[];
  actions?: AiActionSummary[];
  moduleLabel?: string;
  provider?: string;
  model?: string;
};

export function ChatMessageRenderer({
  role,
  content,
  blocks,
  actions,
  moduleLabel,
  provider,
  model,
}: ChatMessageRendererProps) {
  const isUser = role === 'user';
  const resolvedBlocks: ChatBlock[] =
    blocks ??
    [
      { type: 'markdown', content },
      ...(actions ?? []).map((action) => ({ type: 'action' as const, action })),
    ];

  return (
    <div
      className={cn(
        'my-1.5 flex flex-col gap-1 p-3',
        isUser
          ? 'ml-auto max-w-[88%] rounded-xl rounded-br-none bg-primary text-primary-foreground'
          : 'mr-auto max-w-[88%] rounded-xl rounded-bl-none text-foreground',
      )}
    >
      {resolvedBlocks.map((block, index) => {
        if (block.type === 'markdown') {
          return (
            <ChatMarkdownBlock
              key={index}
              content={block.content || '…'}
              variant={isUser ? 'user' : 'assistant'}
            />
          );
        }
        if (block.type === 'action') {
          return (
            <div key={block.action.id} className="-mx-1 mt-2">
              <ChatActionCard action={block.action} />
            </div>
          );
        }
        return null;
      })}
      {!isUser && (moduleLabel || (provider && model)) ? (
        <span className="mt-2 inline-flex w-fit rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground">
          {moduleLabel ? moduleLabel : null}
          {provider && model ? ' · ' : null}
          {provider && model ? model : null}
        </span>
      ) : null}
    </div>
  );
}
